import { Grid, GridItem } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';

import styles from './PageIntro.module.css';

/**
 * The heading block every section page opens with: an h1 and one short paragraph on
 * the statement column. Strings arrive resolved — this never touches a dictionary.
 */

interface PageIntroProps {
  title: string;
  intro: string;
}

export function PageIntro({ title, intro }: PageIntroProps) {
  return (
    <Grid as="section">
      <GridItem span="1/8">
        <Text as="h1" role="display">
          {title}
        </Text>
        <Text as="p" role="body" className={styles.intro}>
          {intro}
        </Text>
      </GridItem>
    </Grid>
  );
}
