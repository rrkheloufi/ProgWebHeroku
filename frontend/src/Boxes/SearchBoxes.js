import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import * as TheMealDb from "../TheMealDB/TheMealDB";
import * as DisplayMealUtils from "../Meal/displayMealUtils";

class Boxes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boxes: null,
      loadingThumbnails: false
    };
  }

  async handleSearch(event) {
    if (event.key === "Enter") {
      this.setState({
        loadingThumbnails: true,
        boxes: null
      });
      let search = event.target.value;
      if (search === "") {
        this.setState({
          loadingThumbnails: false
        });
        return;
      }
      let boxes = (
        await axios.get(`http://localhost:8081/boxes/search`, {
          params: {
            search: search
          }
        })
      ).data;
      this.addImagesThumbnailsToBoxes(boxes);
    }
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
    this.newData.scrollIntoView({ behavior: "smooth" });
  }

  render() {
    return (
      <div>
        <input
          type="search"
          placeholder="Search other user's boxes by name..."
          aria-describedby="button-addon6"
          className="form-control searchBar searchBarBoxes"
          onKeyUp={this.handleSearch.bind(this)}
        />
        <div className="container">
          {this.state.loadingThumbnails === true && (
            <div>
              {DisplayMealUtils.displayLoadingDots()}
              <br />
            </div>
          )}
          <div className="row" ref={ref => (this.newData = ref)}>
            {this.state.boxes && this.state.boxes.length === 0 && (
              <h2>No boxes found.</h2>
            )}
            {this.state.boxes &&
              this.state.boxes.map(box => (
                <div
                  key={box._id}
                  id={box._id}
                  className="col-sm-12 col-md-4 col-lg-3"
                >
                  <Link to={`/box/${box._id}`}>
                    <div className="card mb-3 otherUserBoxCard">
                      <div className="card-header">{box.name}</div>

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
          </div>
        </div>
      </div>
    );
  }
}

export default Boxes;
