import type { Metadata } from 'next';

import { PageIntro } from '@/components/composites/PageIntro';
import { getDictionary } from '@/lib/content';
import { resolveLocale } from '@/lib/locale';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const dictionary = getDictionary(resolveLocale((await params).locale));
  return { title: dictionary.pages.contact.title, description: dictionary.pages.contact.intro };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const dictionary = getDictionary(resolveLocale((await params).locale));

  return <PageIntro intro={dictionary.pages.contact.intro} title={dictionary.pages.contact.title} />;
}
