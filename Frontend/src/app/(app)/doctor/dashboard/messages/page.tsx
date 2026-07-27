import { Messenger } from "@/components/messages/Messenger";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - Shustota AI",
  description: "Chat with patients and staff.",
};

export default function MessagesPage() {
  return (
    <div className="h-[calc(100dvh-144px)] lg:h-[calc(100dvh-64px)] w-full -mt-0">
      <Messenger />
    </div>
  );
}
