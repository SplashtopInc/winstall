import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import styles from "../styles/packsAppList.module.scss";
import SingleApp from "./SingleApp";
import DonateCard from "./DonateCard";

import { FiPlus, FiPlusCircle, FiXCircle } from "react-icons/fi";
import Search from "./Search";
import Modal from "react-modal";

Modal.setAppElement("#__next");

const AppsList = ({ apps, onListUpdate }) => {

  return apps.map((app, index) => (
    <App app={app} index={index} key={app._id} onListUpdate={onListUpdate}/>
  ));
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function App({ app, index, onListUpdate }) {
  return (
    <Draggable draggableId={app._id} index={index}>
      {(provided) => (
        <div
          className={styles.appCard}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <SingleApp app={app} pack={true} displaySelect={false}/>
          <button
            className={styles.unselectApp}
            onClick={() => onListUpdate(app._id)}
            aria-label={"Remove app from pack"}
          >
            <FiPlus />
          </button>
        </div>
      )}
    </Draggable>
  );
}

function PackAppsList({ notLoggedIn = false, providedApps, reorderEnabled, onListUpdate}){

    const [apps, setApps] = useState([]);
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        setApps(providedApps)
    }, [])

    if(!reorderEnabled){
        return (
          <ul className={`${styles.appsList} ${styles.noDragList}`}>
            {apps.map((app, index) => (
              <React.Fragment>
                <div className={styles.appCard} key={app._id}>
                  <SingleApp app={app} pack={true}/>
                </div>

                { index === 3 && <DonateCard addMargin="" />}
              </React.Fragment>
            ))}
          </ul>
        );
    }

    const onDragEnd = (result) => {
      if (!result.destination) {
        return;
      }

      if (result.destination.index === result.source.index) {
        return;
      }

      const updatedApps = reorder(
        apps,
        result.source.index,
        result.destination.index
      );


      onListUpdate(updatedApps)

      setApps(updatedApps);
    }

    const manageUpdates = (id) => {
      const updatedApps = apps.filter(i => i._id !== id);
      setApps(updatedApps);
      onListUpdate(updatedApps);
    }

    const handleSelect = (app, isSelected) => {
      let existingApps = apps;

      if (isSelected) {
        existingApps.push(app);
      } else {
        existingApps = existingApps.filter(a => a._id !== app._id);
      }

      setApps(existingApps);
      onListUpdate(existingApps);

      forceUpdate();
    }

    const closeModal = () => {
      setShowAdd(false);
    }

    return (
      <>
        <h2>Apps in this pack</h2>
        {!notLoggedIn && <p>Tip! Drag and drop any app to re-order how they appear in your pack.</p>}

        <button className={`button center ${apps.length === 0 ? '' : 'subtle'}`} onClick={() => setShowAdd(!showAdd)}><FiPlusCircle/> {`Add ${apps.length != 0 ? "More" : ""} Apps`}</button><br/>

        <Modal
          isOpen={showAdd}
          onRequestClose={closeModal}
          className={styles.addModal}
          overlayClassName={styles.modalOverlay}
          contentLabel="Example Modal"
        >
          <div className={styles.modalHeader}>
            <h2>Add Apps</h2>
            <FiXCircle onClick={closeModal}/>
          </div>
          <Search label="Search for apps to add" preventGlobalSelect={handleSelect} isPackView={true} alreadySelected={apps} limit={4}/>
        </Modal>

        {notLoggedIn ? <p>You need to login first before you can view the apps in this pack.</p> : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={styles.appsList}
                >
                  <AppsList apps={apps} onListUpdate={manageUpdates} />
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) }
      </>
    );

}

export default PackAppsList;