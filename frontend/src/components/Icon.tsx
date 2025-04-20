import { Icon as ChakraIcon, IconProps as ChakraIconProps } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { forwardRef } from 'react';

interface IconProps extends Omit<ChakraIconProps, 'as'> {
  icon: IconType;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const { icon: IconComponent, ...restProps } = props;
  return <ChakraIcon ref={ref} as={IconComponent as unknown as React.ComponentType} {...restProps} />;
});

Icon.displayName = 'Icon'; 