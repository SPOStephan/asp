import { Awards } from '../components/Awards';
import { Culinary } from '../components/Culinary';
import { DirectBooking } from '../components/DirectBooking';
import { Discover } from '../components/Discover';
import { Facts } from '../components/Facts';
import { FAQ } from '../components/FAQ';
import { Generations } from '../components/Generations';
import { Hero } from '../components/Hero';
import { Highlights } from '../components/Highlights';
import { HomeBlog } from '../components/HomeBlog';
import { Newsletter } from '../components/Newsletter';
import { Offers } from '../components/Offers';
import { Welcome } from '../components/Welcome';
import { Wellness } from '../components/Wellness';

export function HomePage() {
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
      <Generations />
      <Awards />
      <Facts />
      <FAQ />
      <HomeBlog />
      <Newsletter />
    </main>
  );
}
