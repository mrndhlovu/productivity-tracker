import React from "react";
import PropTypes from "prop-types";

import UIHeader from "../shared/UIHeader";
import TaskItem from "../shared/TaskItem";
import { useMainContent } from "../../utils/hookUtils";

const TasksList = ({ header, tasks }) => {
  const { taskActionHandler } = useMainContent();

  return (
    <>
      <UIHeader content={header} />

      {tasks.map((task, index) => (
        <TaskItem
          key={index}
          title={task?.title}
          dueDate={task?.dueDate}
          status={task?.status}
          list={task?.list}
          editTaskHandler={(action) => taskActionHandler(action, task)}
        />
      ))}
    </>
  );
};

TasksList.propTypes = {
  header: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.object.isRequired),
};

export default TasksList;