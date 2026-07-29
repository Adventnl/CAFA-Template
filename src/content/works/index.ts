import type { Work } from '@/lib/types';

import { commissionNo14 } from './commission-no-14';
import { edibleHouse } from './edible-house';
import { kilnAndCorridor } from './kiln-and-corridor';
import { lettersToARiverbed } from './letters-to-a-riverbed';
import { nineGreyRooms } from './nine-grey-rooms';
import { paperTopography } from './paper-topography';

/**
 * The only registry. Display order is this array's order — it is not sorted by
 * year or index, because the sequence is an editorial decision.
 *
 * Adding a work: one new file next to this one, one line here, and its images in
 * public/media/source/works/<slug>/. Nothing else in the codebase changes.
 */
export const works: readonly Work[] = [
  commissionNo14,
  edibleHouse,
  paperTopography,
  kilnAndCorridor,
  nineGreyRooms,
  lettersToARiverbed,
];
