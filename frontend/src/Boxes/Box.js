import React, { Component } from "react";
import axios from "axios";

import { Link } from "react-router-dom";

import * as TheMealDb from "../TheMealDB/TheMealDB";
import * as DisplayMealUtils from "../Meal/displayMealUtils";
import auth0Client from "../Auth";

class Box extends Component {
  constructor(props) {
    super(props);
    this.state = {
      box: null,
      meals: null,
      disabled: false,
      id: null,
      userIsOwner: false
    };
  }

  async componentDidMount() {
    const {
      match: { params }
    } = this.props;
    const box = (await axios.get(`http://localhost:8081/box/${params.id}`))
      .data;
    let userIsOwner = box.ownerEmail === auth0Client.getProfile().email;
    const id = params.id;
    const meals = await TheMealDb.getMealsByIds(box.mealsIds);
    this.setState({
      box,
      meals,
      id,
      userIsOwner
    });
  }

  render() {
    const { box, meals } = this.state;
    if (box === null) return DisplayMealUtils.displayLoadingDots();
    return (
      <div className="container">
        <div
          className={
            this.state.userIsOwner
              ? "jumbotron boxJumbotron col-12"
              : "jumbotron boxJumbotronOtherUser col-12"
          }
        >
          <h1 className="my-2">
            {box.name}
            {this.state.userIsOwner && (
              <Link to={`/boxes/update/${box._id}`}>
                <button className="btn btn-circle btn-xl buttonUpdateBox">
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
              </Link>
            )}
          </h1>
          <p className="lead">{box.description}</p>
          <hr className="my-4" />
          <div className="container">
            <div className="row">
              {meals === null && DisplayMealUtils.displayLoadingDots()}
              {meals &&
                DisplayMealUtils.displayMealsThumbnail(meals, null, true, box)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Box;
