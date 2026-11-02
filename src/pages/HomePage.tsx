import { Awards } from '../components/Awards';
import { Culinary } from '../components/Culinary';
import { DirectBooking } from '../components/DirectBooking';
import { Discover } from '../components/Discover';
import { Facts } from '../components/Facts';
import { FAQ } from '../components/FAQ';
import { Generations } from '../components/Generations';
import { Hero } from '../components/Hero';
import { Highlights } from '../components/Highlights';
import { Impressions } from '../components/Impressions';
import { HomeBlog } from '../components/HomeBlog';
import { Newsletter } from '../components/Newsletter';
import { Offers } from '../components/Offers';
import { Welcome } from '../components/Welcome';
import { Wellness } from '../components/Wellness';
import { useCms } from '../cms/CmsContext';
import { useBench } from '../context/BenchContext';
import { DayStory } from '../benchmark/DayStory';

export function HomePage() {
  // Benchmark sections: only in the benchmark copy, and in the CMS so they can be filled.
  const bench = useBench();
  const cms = useCms();
  return (
    <main>
      <Hero />
      <Welcome />
      <Discover />
      <DirectBooking />
      <Offers />
      <Wellness />
      {bench || cms ? <DayStory /> : null}
      <Highlights />
      <Culinary />
      <Generations />
      <Awards />
      <Impressions />
      <Facts />
      <FAQ />
      <HomeBlog />
      <Newsletter />
    </main>
  );
}
