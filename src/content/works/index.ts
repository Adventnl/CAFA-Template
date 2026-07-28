import type { Work } from '@/lib/types';

import { abelMoose } from './abel-moose';
import { dailyFragments } from './daily-fragments';
import { digitalInterfaces } from './digital-interfaces';
import { edibleHouse } from './edible-house';
import { gasStationRenovation } from './gas-station-renovation';
import { guoXiaomeng } from './guo-xiaomeng';
import { humanRemains } from './human-remains';
import { islandArchive } from './island-archive';
import { maxWang } from './max-wang';
import { portfolioInterface } from './portfolio-interface';
import { spatialIllustration } from './spatial-illustration';
import { theObserver } from './the-observer';
import { wangYing } from './wang-ying';
import { xiaohanYu } from './xiaohan-yu';
import { xiranZhang } from './xiran-zhang';

/**
 * The only registry. Display order — newest first, index numbers running down.
 *
 * Adding a work: one file next to this one, one line here, images in
 * public/media/source/works/<slug>/. Nothing else in the codebase changes.
 */
export const works: readonly Work[] = [
  portfolioInterface,
  edibleHouse,
  guoXiaomeng,
  islandArchive,
  wangYing,
  digitalInterfaces,
  spatialIllustration,
  humanRemains,
  abelMoose,
  maxWang,
  xiranZhang,
  dailyFragments,
  xiaohanYu,
  gasStationRenovation,
  theObserver,
];
