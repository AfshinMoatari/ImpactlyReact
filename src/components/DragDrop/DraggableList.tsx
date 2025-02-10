import * as React from 'react';
import DraggableListItem from './DraggableListItem';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder
} from 'react-beautiful-dnd';
import { DragableItem } from '../../models/DragableItem';
import List from '@material-ui/core/List';
import { ListSubheader, Theme, createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      backgroundColor: "rgb(10,8,18, 0.1)",
      padding: 0
    }
  }),
);

export type DraggableListProps = {
  title?: string;
  items: DragableItem[];
  onDragEnd: OnDragEndResponder;
  children?: React.ReactNode;
};

const DraggableList = React.memo(({ title, items, onDragEnd, children }: DraggableListProps) => {
  const classes = useStyles();
  return children !== undefined ?
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list">
          {provided => (
            <div style={{width: "100%"}} ref={provided.innerRef} {...provided.droppableProps}>
              {children}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </> :
    <>
      <List
        subheader={<ListSubheader>{title}</ListSubheader>}
        className={classes.title}></List>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {items.map((item, index) => (
                <DraggableListItem item={item} index={index} key={item.id} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
});

export default DraggableList;
