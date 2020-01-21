import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import auth0Client from "../Auth";
import * as TheMealDb from "../TheMealDB/TheMealDB";
import * as DisplayMealUtils from "../Meal/displayMealUtils";
import SearchBoxes from "./SearchBoxes";

class Boxes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boxes: null,
      loadingThumbnails: true,
      allowModification: true
    };
  }

  getEmailToDisplayBoxes() {
    const {
      match: { params }
    } = this.props;
    let allowModification = true;
    let email;
    if (params.userEmail) {
      email = params.userEmail;
      allowModification = false;
    } else {
      email = auth0Client.getProfile().email;
    }
    this.setState({
      allowModification
    });
    return email;
  }

  async componentDidMount() {
    let userEmail = this.getEmailToDisplayBoxes();
    let boxes = (
      await axios.get(`http://localhost:8081/boxes`, {
        params: {
          ownerEmail: userEmail
        }
      })
    ).data;

    this.setState({
      boxes
    });
    this.addImagesThumbnailsToBoxes(boxes);
  }

  async addImagesThumbnailsToBoxes(boxes) {
    for (let i = 0; i < boxes.length; i++) {
      let box = boxes[i];
      let thumbnails = [];
      for (let j = 0; j < box.mealsIds.length; j++) {
        let id = box.mealsIds[j];
        let meal = await TheMealDb.getMealById(id);
        let img = meal.strMealThumb + "/preview";
        thumbnails.push(img);
        if (j === 3) break;
      }
      boxes[i].thumbnails = thumbnails;
    }
    this.setState({
      boxes,
      loadingThumbnails: false
    });
  }

  confirmSuppression(boxId, name) {
    confirmAlert({
      title: "Confirmation.",
      message: "Are you sure you want to delete the " + name + " box ?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            axios.delete(`http://localhost:8081/box/${boxId}`);
            this.props.history.push("/boxes");
            document.getElementById(boxId).remove(true);
          }
        },
        {
          label: "No",
          onClick: () => this.props.history.push("/boxes")
        }
      ]
    });
  }

  render() {
    return (
      <div className="container">
        {this.state.loadingThumbnails === true && (
          <div>
            {DisplayMealUtils.displayLoadingDots()}
            <br />
          </div>
        )}
        <div className="row">
          {this.state.boxes &&
            this.state.boxes.map(box => (
              <div
                key={box._id}
                id={box._id}
                className="col-sm-12 col-md-4 col-lg-3"
              >
                <Link to={`/box/${box._id}`}>
                  <div
                    className={
                      this.state.allowModification
                        ? "card mb-3 boxCard"
                        : "card mb-3 otherUserBoxCard"
                    }
                  >
                    <div className="card-header">
                      {box.name}
                      {this.state.allowModification && (
                        <button
                          type="button"
                          className="close"
                          data-dismiss="alert"
                          onClick={() => {
                            this.confirmSuppression(box._id, box.name);
                          }}
                        >
                          <span aria-hidden="true">×</span>
                          <span className="sr-only">Close</span>
                        </button>
                      )}
                    </div>

                    <div className="thumbnailContainer">
                      <div className="container">
                        <div className="row">
                          {box.thumbnails &&
                            box.thumbnails.map(img => (
                              <img
                                key={img}
                                src={img}
                                alt="thumbnail"
                                className="col-6 boxThumbnail"
                              ></img>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          {this.state.allowModification && (
            <div key="createBoxCard" className="col-sm-12 col-md-4 col-lg-3">
              <Link to={`/boxes/create`}>
                <div className="card mb-3 boxCard">
                  <div className="card-header">Create new box</div>
                  <div className="card-body">
                    <img
                      className="card-img-top"
                      src="https://cdn4.iconfinder.com/data/icons/meBaze-Freebies/512/add.png"
                      alt="Add Box Img"
                    />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
        {this.props.location.pathname === "/boxes" && <SearchBoxes />}
      </div>
    );
  }
}

export default Boxes;
