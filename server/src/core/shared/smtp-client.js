import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";

async function resolveSmtpHost(host) {
  try {
    await dns.lookup(host);
  } catch (error) {
    throw wrapSmtpError(error, host);
  }
}

function createConnection(config) {
  return new Promise((resolve, reject) => {
    const onError = (error) => reject(wrapSmtpError(error, config.host));
    const socket = config.secure
      ? tls.connect(
          {
            host: config.host,
            port: config.port,
            servername: config.host,
            rejectUnauthorized: false,
          },
          () => resolve(socket),
        )
      : net.connect({ host: config.host, port: config.port }, () => resolve(socket));

    socket.once("error", onError);
  });
}

function waitForResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    function cleanup() {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    }

    function onError(error) {
      cleanup();
      reject(wrapSmtpError(error));
    }

    function onClose() {
      cleanup();
      reject(new Error("SMTP connection closed unexpectedly."));
    }

    function onData(chunk) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const last = lines[lines.length - 1];
      if (/^\d{3}\s/.test(last)) {
        cleanup();
        resolve(last);
      }
    }

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("close", onClose);
  });
}

async function sendCommand(socket, command, expectedPrefixes) {
  socket.write(`${command}\r\n`);
  const response = await waitForResponse(socket);
  if (!expectedPrefixes.some((prefix) => response.startsWith(prefix))) {
    throw new Error(`SMTP error after "${command}": ${response}`);
  }
  return response;
}

function toPlainText(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildMessage(input) {
  const boundary = `ems-${Date.now().toString(36)}`;
  const recipients = input.to.join(", ");
  const from = input.fromName ? `${input.fromName} <${input.fromEmail}>` : input.fromEmail;
  const subject = String(input.subject || "").replace(/\r?\n/g, " ");
  const html = String(input.html || "");
  const text = toPlainText(html);

  return [
    `From: ${from}`,
    `To: ${recipients}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    "",
    `--${boundary}--`,
    "",
  ]
    .join("\r\n")
    .replace(/\n\./g, "\n..");
}

export async function sendSmtpEmail(config, input) {
  await resolveSmtpHost(config.host);
  const socket = await createConnection(config);

  try {
    const greeting = await waitForResponse(socket);
    if (!greeting.startsWith("220")) throw new Error(`SMTP server rejected connection: ${greeting}`);

    await sendCommand(socket, `EHLO ${config.clientName || "localhost"}`, ["250"]);

    if (config.username) {
      await sendCommand(socket, "AUTH LOGIN", ["334"]);
      await sendCommand(socket, Buffer.from(config.username).toString("base64"), ["334"]);
      await sendCommand(socket, Buffer.from(config.password || "").toString("base64"), ["235"]);
    }

    await sendCommand(socket, `MAIL FROM:<${input.fromEmail}>`, ["250"]);
    for (const recipient of input.to) {
      await sendCommand(socket, `RCPT TO:<${recipient}>`, ["250", "251"]);
    }
    await sendCommand(socket, "DATA", ["354"]);
    socket.write(`${buildMessage(input)}\r\n.\r\n`);
    const dataResponse = await waitForResponse(socket);
    if (!dataResponse.startsWith("250")) throw new Error(`SMTP data rejected: ${dataResponse}`);
    await sendCommand(socket, "QUIT", ["221"]);
  } finally {
    socket.end();
  }
}

function wrapSmtpError(error, host) {
  if (error?.code === "ENOTFOUND") {
    return new Error(
      `SMTP host "${host || error.hostname || "unknown"}" could not be resolved. Check Email setup SMTP host or wait for DNS propagation.`,
    );
  }
  if (error?.code === "ECONNREFUSED") {
    return new Error(
      `SMTP connection was refused by "${host || "server"}". Check SMTP port and secure setting.`,
    );
  }
  if (error?.code === "ETIMEDOUT") {
    return new Error(
      `SMTP connection to "${host || "server"}" timed out. Check firewall, port, or server availability.`,
    );
  }
  return error instanceof Error ? error : new Error(String(error || "SMTP error"));
}
