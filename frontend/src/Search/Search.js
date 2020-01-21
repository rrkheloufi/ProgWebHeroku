import React, { Component } from "react";
import * as TheMealDb from "../TheMealDB/TheMealDB";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import * as DisplayMealUtils from "../Meal/displayMealUtils";
import axios from "axios";
import auth0Client from "../Auth";

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: null,
      areas: null,
      ingredients: null,
      meals: null,
      boxes: null
    };
    this.cancel = "";
    this.categoryFilter = [];
    this.areaFilter = [];
    this.ingrFilter = [];
    this.nameFilter = "";
    this.defaultMeals = null;

    this.handleName = this.handleName.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.refreshMeals = this.refreshMeals.bind(this);
  }

  async refreshMeals() {
    this.setState({
      meals: null
    });
    let meals = await TheMealDb.getRandomMeals(16);
    this.setState({
      meals: meals
    });
  }

  async componentDidMount() {
    let categories = await TheMealDb.getCategories();
    let areas = await TheMealDb.getAreas();
    let ingredients = await TheMealDb.getIngredients();
    let meals = await TheMealDb.getRandomMeals(16);
    this.defaultMeals = meals;
    let boxes = [];
    if (auth0Client.isAuthenticated()) {
      let userEmail = auth0Client.getProfile().email;
      boxes = (
        await axios.get(`http://localhost:8081/boxes`, {
          params: {
            ownerEmail: userEmail
          }
        })
      ).data;
    }
    this.setState({
      categories,
      areas,
      ingredients,
      meals,
      boxes
    });
  }

  fetchSearchResults() {
    const catFilter = this.categoryFilter;
    const areaFilter = this.areaFilter;
    const ingrFilter = this.ingrFilter;
    const nameFilter = this.nameFilter;

    TheMealDb.getFilteredMeals(
      catFilter,
      areaFilter,
      ingrFilter,
      nameFilter
    ).then(res => {
      if (
        catFilter.length === 0 &&
        areaFilter.length === 0 &&
        ingrFilter.length === 0 &&
        nameFilter === ""
      )
        this.setState({ meals: this.defaultMeals });
      else this.setState({ meals: res });
    });
  }

  setFilter(filterName, options) {
    if (filterName === "category") this.categoryFilter = options;
    else if (filterName === "area") this.areaFilter = options;
    else if (filterName === "ingredients") this.ingrFilter = options;
  }

  handleChange(e, prop) {
    let selected = [];
    if (e) {
      for (let i = 0; i < e.length; i++) {
        selected.push(e[i].label);
      }
    }

    this.setFilter(prop, selected);
    this.setState({ results: {} }, () => {
      this.fetchSearchResults();
    });
  }

  handleName(e) {
    let name = e.target.value;
    this.nameFilter = name;
    if (e.key === "Enter") {
      this.nameFilter = name;
      this.setState({ results: {} }, () => {
        this.fetchSearchResults();
      });
    }
  }

  handleClick() {
    this.setState({ results: {} }, () => {
      this.fetchSearchResults();
    });
  }

  createSelectItems(categories, optionProp) {
    let items = [];
    for (let i = 0; i < categories.length; i++) {
      items.push({
        value: categories[i][optionProp],
        label: categories[i][optionProp]
      });
    }
    return items;
  }
  createOptions(element, optionProp) {
    let options = [];
    if (element) {
      options = this.createSelectItems(element, optionProp);
    }
    return options;
  }

  renderResults() {
    return (
      <div className="container">
        <div className="row">
          {this.state.meals === null && DisplayMealUtils.displayLoadingDots()}
          {this.state.meals &&
            DisplayMealUtils.displayMealsThumbnail(
              this.state.meals,
              this.state.boxes,
              false,
              null
            )}
        </div>
      </div>
    );
  }

  render() {
    const { categories } = this.state;
    const { areas } = this.state;
    const { ingredients } = this.state;
    let categoryOptions = this.createOptions(categories, "strCategory");
    let areaOptions = this.createOptions(areas, "strArea");
    let ingredientsOptions = this.createOptions(ingredients, "strIngredient");

    const animatedComponents = makeAnimated();

    return (
      <div className="container">
        <div className="container bg-faded py-3">
          <div className="row">
            <img src="./pinmeal.png" className="mx-auto pinMealImg" alt="..." />
            <div className="input-group mb-4 text-center ">
              <input
                type="search"
                placeholder="What are you searching for?"
                aria-describedby="button-addon6"
                className="form-control searchBar"
                onKeyDown={this.handleName}
              />

              <div className="input-group-append">
                <button
                  id="button-addon6"
                  type="submit"
                  className="btn buttonSearchBar"
                  onClick={this.handleClick}
                >
                  <i className="fa fa-search"></i>
                </button>
                <button
                  className="btn btn-circle buttonRefreshMeals"
                  onClick={this.refreshMeals}
                >
                  <i className="fa fa-refresh" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="row" id="filter">
            <div className="col-md-4 col-sm-4 col-xs-6">
              <Select
                closeMenuOnSelect={false}
                placeholder={<div>Select categories</div>}
                onChange={e => this.handleChange(e, "category")}
                components={animatedComponents}
                isMulti
                options={categoryOptions}
              />
            </div>

            <div className="col-md-4 col-sm-4 col-xs-6">
              <Select
                closeMenuOnSelect={false}
                onChange={e => this.handleChange(e, "area")}
                placeholder={<div>Select areas</div>}
                components={animatedComponents}
                isMulti
                options={areaOptions}
              />
            </div>

            <div className="col-md-4 col-sm-4 col-xs-6">
              <Select
                closeMenuOnSelect={false}
                onChange={e => this.handleChange(e, "ingredients")}
                placeholder={<div>Select ingredients</div>}
                components={animatedComponents}
                isMulti
                options={ingredientsOptions}
              />
            </div>
          </div>
        </div>

        {this.state.meals == null && DisplayMealUtils.displayLoadingDots()}
        {this.state.meals && this.renderResults()}
      </div>
    );
  }
}

export default SearchBar;
