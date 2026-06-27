import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-center"
      gutter={10}
      containerStyle={{ bottom: 16 }}
      toastOptions={{
        duration: 2800,
        success: {
          duration: 2600,
        },
        error: {
          duration: 3600,
        },
      }}
    />
  );
}
