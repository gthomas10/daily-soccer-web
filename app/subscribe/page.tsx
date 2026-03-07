import { SubscribeContent } from "./SubscribeContent";

export const metadata = {
  title: "Subscribe | Daily Soccer Report",
  description:
    "Go premium for early access, bonus content, ad-free listening, and the full episode archive.",
};

export default function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  return <SubscribeContent searchParams={searchParams} />;
}
