import { Messenger } from "@/components/messages/Messenger";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - Oxpecker AI",
  description: "Chat with patients and staff.",
};

export default function MessagesPage() {
  return (
    <div className="h-full w-full">
      <Messenger />
    </div>
  );
}
