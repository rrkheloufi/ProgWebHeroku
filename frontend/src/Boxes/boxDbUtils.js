import axios from "axios";

export async function addMealToBox(box, mealId) {
  let indexToRemove = box.mealsIds.indexOf(mealId);
  if (indexToRemove === -1) {
    box.mealsIds.push(mealId);
    updateBoxInDb(box);
  }
}

export async function removeMealFromBox(box, mealId) {
  let indexToRemove = box.mealsIds.indexOf(mealId);
  if (indexToRemove === -1) {
    return;
  }
  updateBoxInDb(box);
  box.mealsIds.splice(indexToRemove, 1);
}

async function updateBoxInDb(box) {
  await axios.put(
    "http://localhost:8081/box/" + box._id,
    {
      mealsIds: box.mealsIds
    } /*,
              {
                headers: { Authorization: `Bearer ${auth0Client.getIdToken()}` }
              }*/
  );
}
