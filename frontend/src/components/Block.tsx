import * as React from 'react';
import { Form } from '.';
import { motion, useMotionValue } from 'framer-motion';
import { Adapter, AdapterKind } from '../lib/adapters/adapter';
const { useEffect, useState, useRef } = React;
// Config
const onTop = { zIndex: 1, scale: 1.12 };
const flat = {
  scale: 1,
  zIndex: 0,
  transition: { delay: 0.3 },
};
const maxHeight = '300px';

const Block = ({
  color,
  setPosition,
  moveItem,
  i,
  adapter,
  id,
}: {
  color: string;
  setPosition: Function;
  moveItem: Function;
  i: number;
  adapter: Adapter;
  id: number;
}) => {
  const [isDragging, setDragging] = useState(false);

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
    <motion.div
      ref={ref}
      initial={false}
      // If we're dragging, we want to set the zIndex of that item to be on top of the other items.
      animate={isDragging ? onTop : flat}
      style={{
        background: color,
        maxHeight,
        width: '400px',
        borderRadius: '3px',
        marginBottom: '10px',
      }}
      drag="y"
      dragOriginY={dragOriginY}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={1}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
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
      {adapter.kind === AdapterKind.NULL ? (
        <Form i={i} id={id} />
      ) : (
        <div>Title {i + 1}</div>
      )}
    </motion.div>
  );
};

export { Block };
