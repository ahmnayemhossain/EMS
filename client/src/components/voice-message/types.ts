export type VoiceMessageProps = {
  src: string;
  durationSec?: number;
  className?: string;
  density?: "default" | "compact";
  variant?: "default" | "whatsapp";
  labels?: {
    play?: string;
    pause?: string;
  };
};
