import axios from "axios";

export async function getRandomMeals(numberOfMeals) {
  let meals = [];
  let ids = [];
  for (var i = 0; i < numberOfMeals; i++) {
    let meal = (
      await axios.get("https://www.themealdb.com/api/json/v1/1/random.php")
    ).data["meals"][0];
    let mealId = meal.idMeal;
    //To prevent two same meals.
    while (ids.includes(mealId)) {
      meal = (
        await axios.get("https://www.themealdb.com/api/json/v1/1/random.php")
      ).data["meals"][0];
      mealId = meal.idMeal;
    }
    ids.push(mealId);
    meals.push(meal);
  }
  return meals;
}

export async function getMealById(mealId) {
  let meal = (
    await axios.get(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + mealId
    )
  ).data["meals"][0];

  let ingredientsArr = [];
  for (let index = 1; index <= 20; index++) {
    let ingredientProp = "strIngredient" + index;
    let quantityProp = "strMeasure" + index;
    let name = meal[ingredientProp];
    let quantity = meal[quantityProp];
    if (name !== "") {
      let ingredientObj = {
        ingredient: name,
        quantity: quantity
      };
      ingredientsArr.push(ingredientObj);
    }
  }

  return {
    idMeal: meal.idMeal,
    strMeal: meal.strMeal,
    strInstructions: meal.strInstructions,
    strMealThumb: meal.strMealThumb,
    strTags: meal.strTags,
    strYoutube: meal.strYoutube,
    strCategory: meal.strCategory,
    strArea: meal.strArea,
    strSource: meal.strSource,
    ingredients: ingredientsArr
  };
}

export async function getMealsByIds(mealIds) {
  let mealArray = [];
  for (let i = 0; i < mealIds.length; i++) {
    let id = mealIds[i];
    let meal = await getMealById(id);
    mealArray.push(meal);
  }
  return mealArray;
}

export async function getCategories() {
  let cat = (
    await axios.get("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
  ).data["meals"];
  return cat;
}

export async function getAreas() {
  let areas = (
    await axios.get("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
  ).data["meals"];
  return areas;
}

export async function getIngredients() {
  let ingredients = (
    await axios.get("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
  ).data["meals"];
  return ingredients;
}

function intersectArrays(arrayOne, arrayTwo) {
  if (arrayOne.length === 0) return arrayTwo;
  else if (arrayTwo.length === 0) return arrayOne;
  let results = [];
  arrayOne.map(function(item1) {
    arrayTwo.map(function(item2) {
      if (item1.idMeal === item2.idMeal) {
        results.push(item1);
      }
    });
  });
  return results;
}

async function getFilterResults(filter, prefix) {
  let result = [];
  for (let i = 0; i < filter.length; i++) {
    let temp = (
      await axios.get(
        "https://www.themealdb.com/api/json/v1/1/filter.php?" +
          prefix +
          "=" +
          filter[i]
      )
    ).data["meals"];
    if (temp) result = result.concat(temp);
  }
  return result;
}
//

export async function getFilteredMeals(categories, areas, ingredients, name) {
  let catResults = await getFilterResults(categories, "c");
  let areaResults = await getFilterResults(areas, "a");
  let ingResults = await getFilterResults(ingredients, "i");
  let nameResults = [];
  if (name !== "")
    nameResults = (
      await axios.get(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + name
      )
    ).data["meals"];

  let interRes = intersectArrays(nameResults, catResults);
  interRes = intersectArrays(interRes, areaResults);
  interRes = intersectArrays(interRes, ingResults);
  return interRes;
}
