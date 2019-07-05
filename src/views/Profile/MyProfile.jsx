import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import MyContent from './MyProfile/MyContent';
import SideBar from './SideBar';
import Nav from '../../components/Nav';
import './styles/Profile.css';
import MyProfileHeaders from './MyProfile/MyProfileHeaders';

class Profile extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      image,
      name,
      currentAddress,
    } = this.props;

    return (
      <div>
        {console.log('objectimagMyProfileHeaderse', image)}

        <MyProfileHeaders
          image={image}
          name={name}
          currentAddress={currentAddress}
        />

        <Nav />
        <div id="profile__page">
          <div id="profile__contents">
            <SideBar />
            <MyContent />
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  name: PropTypes.string,
  currentAddress: PropTypes.string,
  image: PropTypes.array,
};

Profile.defaultProps = {
  name: '',
  currentAddress: '',
  image: null,
};

const mapState = state => ({
  name: state.myData.name,
  image: state.myData.image,
  currentAddress: state.userState.currentAddress,
});

export default withRouter(connect(mapState)(Profile));