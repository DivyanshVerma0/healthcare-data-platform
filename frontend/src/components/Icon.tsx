import React from 'react';
import { Icon as ChakraIcon } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface IconProps {
  icon: IconType;
  boxSize?: string | number;
  color?: string;
  [key: string]: any;
}

const Icon = ({ icon: IconComponent, ...props }: IconProps) => {
  return <ChakraIcon as={IconComponent as unknown as React.ElementType} {...props} />;
};

export default Icon; 