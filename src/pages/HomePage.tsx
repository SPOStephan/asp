import { Awards } from '../components/Awards';
import { Culinary } from '../components/Culinary';
import { DirectBooking } from '../components/DirectBooking';
import { Discover } from '../components/Discover';
import { Facts } from '../components/Facts';
import { FAQ } from '../components/FAQ';
import { Hero } from '../components/Hero';
import { Highlights } from '../components/Highlights';
import { Impressions } from '../components/Impressions';
import { HomeBlog } from '../components/HomeBlog';
import { Newsletter } from '../components/Newsletter';
import { Offers } from '../components/Offers';
import { Welcome } from '../components/Welcome';
import { Wellness } from '../components/Wellness';

export function HomePage() {
  // "Ein Tag im Hotel" and "Für jeden Anlass" are building blocks now (src/lib/blocks.ts):
  // placed in the CMS wherever wanted, on this page too.
  return (
    <main>
      <Hero />
      <Welcome />
      <Discover />
      <DirectBooking />
      <Offers />
      <Wellness />
      <Highlights />
      <Culinary />
      <Awards />
      <Impressions />
      <Facts />
      <FAQ />
      <HomeBlog />
      <Newsletter />
    </main>
  );
}
