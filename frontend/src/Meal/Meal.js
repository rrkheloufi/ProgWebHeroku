import React, { Component } from "react";
import * as TheMealDb from "../TheMealDB/TheMealDB";
import { AddInBoxModal } from "../Meal/displayMealUtils";
import Comments from "../Meal/Comments";
import axios from "axios";
import auth0Client from "../Auth";

class Meal extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params }
    } = this.props;
    this.state = {
      meal: null,
      boxes: null
    };
    this.rating = 5;
    this.mealId = params.mealId;
  }

  async componentDidMount() {
    const {
      match: { params }
    } = this.props;
    let meal = await TheMealDb.getMealById(params.mealId);
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
      meal,
      boxes
    });
  }

  renderStars(nbOfStars) {
    let elements = [];
    for (let i = 0; i < 5 - nbOfStars; i++)
      elements.push(
        <span className="float-right">
          <i className="text-warning fa fa-star-o"></i>
        </span>
      );
    for (let i = 0; i < nbOfStars; i++)
      elements.push(
        <span className="float-right">
          <i className="text-warning fa fa-star"></i>
        </span>
      );
    return elements;
  }

  render() {
    const { meal, boxes } = this.state;
    if (meal === null)
      return (
        <div className="spinners">
          <div className="spinner-grow text-primary" role="status" />
          <div className="spinner-grow text-primary" role="status" />
          <div className="spinner-grow text-primary" role="status" />
        </div>
      );
    return (
      <div className="container showAddBoxButton">
        <h1 className="my-4">{meal.strMeal}</h1>

        <div className="row">
          <div className="card mb-3 meal-info">
            <div className="row no-gutters">
              <div className="col-md-3">
                <img src={meal.strMealThumb} className="card-img" alt="..." />
              </div>
              <div className="col-md-9">
                {auth0Client.isAuthenticated() && (
                  <AddInBoxModal
                    boxes={boxes}
                    mealid={meal.idMeal}
                    displayboxpagethumbnail={0}
                    box={null}
                  />
                )}
                <div className="card-body">
                  <table className="table">
                    <tbody>
                      <tr>
                        <th scope="row">Category</th>
                        <td>{meal.strCategory}</td>
                      </tr>
                      <tr>
                        <th scope="row">Area</th>
                        <td>{meal.strArea}</td>
                      </tr>
                      <tr>
                        <th scope="row">Youtube</th>
                        <td>
                          <a
                            href={meal.strYoutube}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {meal.strYoutube}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Source</th>
                        <td>
                          <a
                            href={meal.strSource}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {meal.strSource}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Tags</th>
                        <td>{meal.strTags}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h3 className="my-4">Ingredients</h3>
        <div className="row">
          {this.state.meal.ingredients.map(
            ingredient =>
              ingredient.ingredient && (
                <div
                  key={ingredient.ingredient + ingredient.quantity}
                  className="col-md-2 col-sm-4 mb-4"
                >
                  <div className="card ingredient">
                    <div className="card-header">{ingredient.ingredient}</div>
                    <div className="card-body">
                      <img
                        className="img-fluid"
                        src={
                          "https://www.themealdb.com/images/ingredients/" +
                          ingredient.ingredient +
                          ".png"
                        }
                        alt=""
                      />
                    </div>
                    <div className="card-footer">{ingredient.quantity}</div>
                  </div>
                </div>
              )
          )}
        </div>
        <h3 className="my-3">Instructions</h3>
        <div className="row instructions">
          <ul>
            {meal.strInstructions.split("\n").map((item, i) => {
              if (item !== "\r") return <li key={i}>{item}</li>;
            })}
          </ul>
        </div>
        <Comments mealId={this.mealId} />
      </div>
    );
  }
}

export default Meal;
