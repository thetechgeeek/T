declare module '@shopify/flash-list' {
  import { Component } from 'react';
  import { FlatListProps } from 'react-native';

  export interface FlashListProps<T> extends FlatListProps<T> {
    estimatedItemSize: number;
    drawDistance?: number;
  }

  export class FlashList<T> extends Component<FlashListProps<T>> {}
}
