import React, { Component } from "react";
import ReactStarRating from "react-star-ratings-component";
import axios from "axios";
import auth0Client from "../Auth";

class Comments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: null,
      mealStats: null,
      isAddedNewComment: false
    };
    this.rating = 5;
    this.description = "";
    this.title = "";
    this.name = "";
    this.mealId = props.mealId;
    this.user = props.user;
  }

  async componentDidMount() {
    let comments = (
      await axios.get(`http://localhost:8081/comments/` + this.mealId)
    ).data;
    let mealStats = (
      await axios.get(`http://localhost:8081/mealStats/` + this.mealId)
    ).data;
    this.setState({
      comments,
      mealStats
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

  canDelete(comment) {
    if (auth0Client.isAuthenticated()) {
      let userEmail = auth0Client.getProfile().name;
      if (userEmail === comment.ownerEmail) return true;
    }
    return false;
  }

  async deleteComment(comment, commentId) {
    console.log("comment id " + comment._id);
    await axios.delete("http://localhost:8081/comment/" + comment._id);

    let newTotalComments = this.state.mealStats.totalComments - 1;
    let newSumStars = this.state.mealStats.sumStars - comment.stars;
    await axios.put("http://localhost:8081/stat/" + this.mealId, {
      mealId: this.mealId,
      totalComments: newTotalComments,
      sumStars: newSumStars
    });

    let mealStats = (
      await axios.get(`http://localhost:8081/mealStats/` + this.mealId)
    ).data;
    let comments = (
      await axios.get(`http://localhost:8081/comments/` + this.mealId)
    ).data;
    this.setState({
      mealStats: mealStats,
      comments: comments
    });
  }

  async submit(e) {
    e.preventDefault();
    if (auth0Client.isAuthenticated()) {
      let userEmail = auth0Client.getProfile().name;
      await axios.post("http://localhost:8081/comment", {
        ownerEmail: userEmail,
        mealId: this.mealId,
        description: this.description,
        stars: this.rating,
        title: this.title
      });

      let newTotalComments = 1;
      let newSumStars = this.rating;
      if (this.state.mealStats) {
        newTotalComments = this.state.mealStats.totalComments + 1;
        newSumStars = this.state.mealStats.sumStars + this.rating;
      }

      await axios.put("http://localhost:8081/stat/" + this.mealId, {
        mealId: this.mealId,
        totalComments: newTotalComments,
        sumStars: newSumStars
      });

      let comments = (
        await axios.get(`http://localhost:8081/comments/` + this.mealId)
      ).data;
      let mealStats = (
        await axios.get(`http://localhost:8081/mealStats/` + this.mealId)
      ).data;

      this.setState({
        comments: comments,
        mealStats: mealStats,
        isAddedNewComment: true
      });
    }
  }

  render() {
    const { comments, mealStats } = this.state;
    return (
      <div className="comments jumbotron">
        <h3>
          Comments{" "}
          {mealStats &&
            this.renderStars(
              Math.round(mealStats.sumStars / mealStats.totalComments)
            )}
        </h3>
        <hr className="my-4" />
        {auth0Client.isAuthenticated() && (
          <div className="container">
            <form>
              <h5>
                <em>Did you try this recipe? Tell us what you thought !</em>
              </h5>
              <ReactStarRating
                numberOfStar={5}
                numberOfSelectedStar={5}
                colorFilledStar="orange"
                colorEmptyStar="white"
                starSize="30px"
                spaceBetweenStar="5px"
                disableOnSelect={false}
                onSelectStar={val => {
                  this.rating = val;
                }}
              />

              <div className="form-group">
                <input
                  className="form-control"
                  id="title"
                  placeholder="Title"
                  onChange={e => (this.title = e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-control"
                  id="description"
                  rows="3"
                  placeholder="Comment"
                  onChange={e => (this.description = e.target.value)}
                ></textarea>
              </div>
              <button
                className="btn btn-primary mb-2"
                onClick={e => this.submit(e)}
              >
                Submit
              </button>
            </form>
          </div>
        )}

        <hr className="my-4" />
        {this.state.isAddedNewComment && (
          <span className="badge badge-success">New comment added !</span>
        )}
        {comments &&
          comments.map((item, i) => {
            return (
              <div id={"comment-" + i} className="card comment-card">
                <div className="card-header comment-header">
                  {this.canDelete(item) && (
                    <button
                      className="float-left btn btn-danger del-comment-btn"
                      onClick={e => this.deleteComment(item, "comment-" + i)}
                    >
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  )}
                  <h4 className="float-left">{item.title}</h4>
                  {this.renderStars(item.stars)}
                </div>
                <div className="card-body">
                  <blockquote className="blockquote mb-0">
                    <p>{item.description}</p>
                    <footer className="blockquote-footer">
                      {item.ownerEmail}
                    </footer>
                  </blockquote>
                </div>
              </div>
            );
          })}
      </div>
    );
  }
}

export default Comments;
