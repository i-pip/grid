import * as React from 'react';
import { FormatterProps } from '@supabase/react-data-grid';
import { SupaRow } from '../../types';

export const BooleanFormatter = (
  p: React.PropsWithChildren<FormatterProps<SupaRow, unknown>>
) => {
  const value = p.row[p.column.key] as boolean;
  return <>{value ? 'true' : 'false'}</>;
};
