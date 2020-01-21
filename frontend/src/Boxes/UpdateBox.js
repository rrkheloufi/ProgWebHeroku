import React, { Component } from "react";
import { withRouter } from "react-router-dom";
//import auth0Client from "../Auth";
import axios from "axios";
import auth0Client from "../Auth";

class CreateBox extends Component {
  constructor(props) {
    super(props);
    let userEmail = auth0Client.getProfile().email;

    this.state = {
      disabled: false,
      boxName: "",
      ownerEmail: userEmail,
      description: null,
      _id: null
    };
  }

  async componentDidMount() {
    const {
      match: { params }
    } = this.props;
    const box = (await axios.get(`http://localhost:8081/box/${params.boxId}`))
      .data;
    const _id = box._id;
    const boxName = box.name;
    const description = box.description;

    this.setState({
      boxName,
      description,
      _id
    });
  }

  updateName(value) {
    this.setState({
      boxName: value
    });
  }

  updateDescription(value) {
    this.setState({
      description: value
    });
  }

  async submit() {
    this.setState({
      disabled: true
    });

    await axios.put(
      "http://localhost:8081/box/" + this.state._id,
      {
        name: this.state.boxName,
        description: this.state.description
      } /*,
      {
        headers: { Authorization: `Bearer ${auth0Client.getIdToken()}` }
      }*/
    );

    this.props.history.push("/box/" + this.state._id);
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-header">Update Box</div>
              <div className="card-body text-left">
                <div className="form-group">
                  <label htmlFor="Box name">Name:</label>
                  <input
                    disabled={this.state.disabled}
                    type="text"
                    defaultValue={this.state.boxName}
                    onBlur={e => {
                      this.updateName(e.target.value);
                    }}
                    className="form-control"
                  ></input>
                </div>
                <div className="form-group">
                  <label htmlFor="Box description">Description:</label>
                  <input
                    disabled={this.state.disabled}
                    type="text"
                    defaultValue={this.state.description}
                    onBlur={e => {
                      this.updateDescription(e.target.value);
                    }}
                    className="form-control"
                    placeholder="Give more context to your box."
                  />
                </div>
                <button
                  disabled={this.state.disabled}
                  className="btn btn-primary"
                  onClick={() => {
                    this.submit();
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// module.exports = CreateBox;

export default withRouter(CreateBox);
