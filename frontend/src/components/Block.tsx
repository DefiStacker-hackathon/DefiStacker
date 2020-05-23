import * as React from 'react';
import { BlockForm, BlockConnection } from '.';
import { motion, useMotionValue } from 'framer-motion';
import { Adapter } from '../lib/adapters/adapter';
const { useEffect, useState, useRef } = React;
import { usePipelineDispatch } from '../context';

const maxHeight = '300px';
const DraggingStyle: string = `{
  zIndex: 1,
  scale: 1.12,
}`;
const DefaultStyle: string = `{
  scale: 1,
  zIndex: 0,
  transition: { delay: 0.3 },
}`;

const Block = ({
  color,
  setPosition,
  moveItem,
  i,
  adapter,
  id,
  previous,
  next,
  chainLength,
}: {
  color: string;
  setPosition: Function;
  moveItem: Function;
  i: number;
  adapter: Adapter;
  id: number;
  previous: number[];
  next: number[];
  chainLength: number;
}) => {
  const [isDragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [isHovering, setIsHovering] = useState(chainLength === 1);

  const dispatch = usePipelineDispatch();

  // We'll use a `ref` to access the DOM element that the `motion.li` produces.
  // This will allow us to measure its height and position, which will be useful to
  // decide when a dragging element should switch places with its siblings.
  const ref = useRef(null);

  // By manually creating a reference to `dragOriginY` we can manipulate this value
  // if the user is dragging this DOM element while the drag gesture is active to
  // compensate for any movement as the items are re-positioned.
  const dragOriginY = useMotionValue(0);

  // Update the measured position of the item so we can calculate when we should rearrange.
  useEffect(() => {
    setPosition(i, {
      height: ref.current.offsetHeight,
      top: ref.current.offsetTop,
    });
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div
        ref={ref}
        initial={false}
        // If we're dragging, we want to set the zIndex of that item to be on top of the other items.
        animate={isDragging ? DraggingStyle : DefaultStyle}
        style={{
          background: color,
          maxHeight,
          width: '100%',
          borderRadius: '3px',
          marginBottom: '10px',
          cursor: "pointer"
        }}
        drag="y"
        dragOriginY={dragOriginY}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={1}
        onDragStart={() => {
          setDragStart(i);
          setDragging(true);
        }}
        onDragEnd={() => {
          if (dragStart != i)
            dispatch({
              type: 'move',
              id,
              to: { incoming: previous, outgoing: next },
            });
          setDragging(false);
        }}
        onDrag={(e, { point }) => moveItem(i, point.y)}
        positionTransition={({ delta }) => {
          if (isDragging) {
            // If we're dragging, we want to "undo" the items movement within the list
            // by manipulating its dragOriginY. This will keep the item under the cursor,
            // even though it's jumping around the DOM.
            dragOriginY.set(dragOriginY.get() + delta.y);
          }

          // If `positionTransition` is a function and returns `false`, it's telling
          // Motion not to animate from its old position into its new one. If we're
          // dragging, we don't want any animation to occur.
          return !isDragging;
        }}
      >
        <BlockForm id={id} adapter={adapter} isHovering={isHovering} />
      </motion.div>
      <BlockConnection
        id={id}
        previous={previous}
        next={next}
        isHovering={isHovering}
      />
    </div>
  );
};

export { Block };
