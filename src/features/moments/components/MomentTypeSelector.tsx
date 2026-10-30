import React from 'react';

import { MomentTypeChips } from './MomentTypeChips';
import type { MomentType } from '../types';

interface MomentTypeSelectorProps {
  value: MomentType;
  onChange: (type: MomentType) => void;
  disabled?: boolean;
}

export const MomentTypeSelector: React.FC<MomentTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => (
  <MomentTypeChips
    value={value}
    onChange={(type) => type && onChange(type)}
    disabled={disabled}
  />
);
