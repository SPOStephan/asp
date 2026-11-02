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
import { useBench } from '../context/BenchContext';
import { DayStory } from '../benchmark/DayStory';
import { useBlockOnHome } from '../components/PageBlocks';

export function HomePage() {
  // Building blocks (src/lib/blocks.ts) keep their place here while the start page is
  // ticked for them in the CMS. The benchmark copy shows the start page without them.
  const bench = useBench();
  const dayStory = useBlockOnHome('day_story') && !bench;
  const generations = useBlockOnHome('generations') && !bench;
  return (
    <main>
      <Hero />
      <Welcome />
      <Discover />
      <DirectBooking />
      <Offers />
      <Wellness />
      {dayStory ? <DayStory /> : null}
      <Highlights />
      <Culinary />
      {generations ? <Generations /> : null}
      <Awards />
      <Impressions />
      <Facts />
      <FAQ />
      <HomeBlog />
      <Newsletter />
    </main>
  );
}
