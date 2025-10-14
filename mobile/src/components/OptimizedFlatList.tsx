import React, { memo } from 'react';
import { FlatList, FlatListProps, StyleSheet } from 'react-native';

/**
 * Optimized FlatList with performance best practices
 * - windowSize optimization
 * - removeClippedSubviews for better performance
 * - maxToRenderPerBatch optimization
 * - updateCellsBatchingPeriod optimization
 * - initialNumToRender optimization
 * - getItemLayout for fixed height items (optional)
 */

interface OptimizedFlatListProps<T> extends FlatListProps<T> {
  estimatedItemSize?: number;
  fixedItemHeight?: number;
}

function OptimizedFlatListComponent<T>(
  props: OptimizedFlatListProps<T>,
  ref: React.Ref<FlatList<T>>
) {
  const {
    estimatedItemSize = 100,
    fixedItemHeight,
    windowSize = 10,
    maxToRenderPerBatch = 10,
    initialNumToRender = 10,
    updateCellsBatchingPeriod = 50,
    removeClippedSubviews = true,
    getItemLayout,
    ...restProps
  } = props;

  // Optimized getItemLayout for fixed height items
  const optimizedGetItemLayout = React.useCallback(
    (data: ArrayLike<T> | null | undefined, index: number) => {
      if (fixedItemHeight) {
        return {
          length: fixedItemHeight,
          offset: fixedItemHeight * index,
          index,
        };
      }
      return getItemLayout?.(data, index);
    },
    [fixedItemHeight, getItemLayout]
  );

  return (
    <FlatList
      ref={ref}
      windowSize={windowSize}
      maxToRenderPerBatch={maxToRenderPerBatch}
      initialNumToRender={initialNumToRender}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      removeClippedSubviews={removeClippedSubviews}
      getItemLayout={fixedItemHeight ? optimizedGetItemLayout : getItemLayout}
      {...restProps}
    />
  );
}

export const OptimizedFlatList = memo(
  React.forwardRef(OptimizedFlatListComponent)
) as <T>(
  props: OptimizedFlatListProps<T> & { ref?: React.Ref<FlatList<T>> }
) => React.ReactElement;
