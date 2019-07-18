import React, { Component } from 'react';
import {
  Route, Switch, withRouter, Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as routes from './utils/routes';
import { pollNetworkAndAddress, initialAddress, startPollFlag } from './utils/address';
import { normalizeURL, matchProtectedRoutes, checkIsEthAddress } from './utils/funcs';
import { store } from './state/store';
import history from './utils/history';
import actions from './state/actions';

import APIs from './views/Landing/API/APIs';
import Dapp from './views/Landing/Dapp/Dapp';
import LandingNew from './views/Landing/LandingNew';
import Partners from './views/Landing/Partners';
import Team from './views/Landing/Team';
import Spaces from './views/Spaces/Spaces';
import MyProfile from './views/Profile/MyProfile';
import PubProfile from './views/Profile/PubProfile';
import NoMatch from './views/Landing/NoMatch';
import EditProfile from './views/Profile/EditProfile';
import Careers from './views/Landing/Careers';
import Privacy from './views/Landing/Privacy';
import Terms from './views/Landing/Terms';
import Create from './views/Landing/Create';
import NavLanding from './components/NavLanding';
import AppHeaders from './components/AppHeaders';
import AppModals from './components/AppModals';
import Nav from './components/Nav';
import './index.css';

const {
  handleSignInModal,
  closeErrorModal,
  handleRequireWalletLoginModal,
  handleSwitchedNetworkModal,
  handleAccessModal,
  closeRequireMetaMaskModal,
  handleConsentModal,
  handleDeniedAccessModal,
  handleLoggedOutModal,
  handleSwitchedAddressModal,
  requireMetaMaskModal,
  handleMobileWalletModal,
  handleOnboardingModal,
  handleFollowingPublicModal,
  handleContactsModal,
} = actions.modal;

const {
  getMyProfileValue,
  getMyDID,
  getCollectibles,
  getMyMemberSince,
  getVerifiedPublicGithub,
  getVerifiedPublicTwitter,
  getVerifiedPrivateEmail,
  getActivity,
  getMyFollowing,
  saveFollowing,
} = actions.profile;

const { getMySpacesData, convert3BoxToSpaces } = actions.spaces;

const {
  openBox,
  handleSignOut,
  injectWeb3,
} = actions.signin;

const {
  checkMobileWeb3,
  checkNetwork,
} = actions.land;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onBoardingModalMobileOne: false,
      onBoardingModalMobileTwo: false,
      onBoardingModalMobileThree: false,
    };
    // this.handleSignInUp = this.handleSignInUp.bind(this);
    // this.directSignIn = this.directSignIn.bind(this);
    // this.getMyData = this.getMyData.bind(this);
  }

  async componentDidMount() {
    const { location } = this.props;
    const { pathname } = location;
    const normalizedPath = normalizeURL(pathname);
    const splitRoute = normalizedPath.split('/');
    const isMyProfilePath = matchProtectedRoutes(splitRoute[2]);
    const currentEthAddress = window.localStorage.getItem('userEthAddress');
    const isEtherAddress = checkIsEthAddress(splitRoute[1]);
    const isMyAddr = splitRoute[1] === currentEthAddress;
    const onProfilePage = isEtherAddress;
    const allowDirectSignIn = (
      isEtherAddress // Lands on profile page
      && isMyProfilePath // Lands on protected page
      && isMyAddr
    );

    try {
      initialAddress(); // Initial get address

      if (allowDirectSignIn) { // Begin signin
        this.directSignIn();
      } else if (onProfilePage) { // Lands on profile page
        if (isMyProfilePath) history.push(`/${splitRoute[1]}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    const { pathname } = location;
    const normalizedPath = normalizeURL(pathname);
    const isNewPath = nextProps.location.pathname !== normalizedPath;
    const onSyncDoneToTrigger = nextProps.onSyncFinished && nextProps.isSyncing;

    if (isNewPath) { // check previous route for banner behavior on /Create & /Profiles
      store.dispatch({
        type: 'UI_ROUTE_UPDATE',
        currentRoute: normalizedPath,
      });
    }

    if (onSyncDoneToTrigger) { // get profile data again only when onSyncDone
      store.dispatch({ // end onSyncDone animation
        type: 'UI_APP_SYNC',
        onSyncFinished: true,
        isSyncing: false,
      });
      this.getMyData();
    }
  }

  getMyData = async () => {
    const { currentAddress } = this.props;
    store.dispatch({
      type: 'UI_SPACES_LOADING',
      isSpacesLoading: true,
    });
    startPollFlag();
    pollNetworkAndAddress(); // Start polling for address change

    try {
      this.props.getVerifiedPublicGithub();
      this.props.getVerifiedPublicTwitter();
      this.props.getVerifiedPrivateEmail();
      this.props.getMyMemberSince();
      this.props.getMyDID();
      this.props.getMyProfileValue('public', 'status');
      this.props.getMyProfileValue('public', 'name');
      this.props.getMyProfileValue('public', 'description');
      this.props.getMyProfileValue('public', 'image');
      this.props.getMyProfileValue('public', 'coverPhoto');
      this.props.getMyProfileValue('public', 'location');
      this.props.getMyProfileValue('public', 'website');
      this.props.getMyProfileValue('public', 'employer');
      this.props.getMyProfileValue('public', 'job');
      this.props.getMyProfileValue('public', 'school');
      this.props.getMyProfileValue('public', 'degree');
      this.props.getMyProfileValue('public', 'major');
      this.props.getMyProfileValue('public', 'year');
      this.props.getMyProfileValue('public', 'emoji');
      this.props.getMyProfileValue('private', 'birthday');

      await this.props.getMyFollowing();
      await this.props.getCollectibles(currentAddress);
      await this.props.convert3BoxToSpaces();
      await this.props.getMySpacesData(currentAddress);

      this.props.getActivity();
    } catch (err) {
      console.error(err);
    }
  }

  handleNextMobileModal = (thisModal, nextModal) => {
    this.setState({
      [`onBoardingModalMobile${thisModal}`]: false,
      [`onBoardingModalMobile${nextModal}`]: true,
    });
  }

  directSignIn = async () => {
    const {
      location,
    } = this.props;
    const { pathname } = location;
    const normalizedPath = normalizeURL(pathname);
    const currentUrlEthAddr = normalizedPath.split('/')[1];
    const profilePage = normalizedPath.split('/')[2];

    try {
      await this.props.checkMobileWeb3(); // this exists now only for mobile
      await this.props.injectWeb3('directLogin');
      await this.props.checkNetwork();

      const allowSignIn = this.props.isSignedIntoWallet;
      // const allowSignIn = (this.props.isSignedIntoWallet && this.props.isLoggedIn);
      // const notSignedIn = (this.props.isSignedIntoWallet
      //   && !this.props.isLoggedIn
      //   && matchProtectedRoutes(profilePage));

      if (allowSignIn) {
        // if route doesnt match this url, historypush to the correct url
        if (currentUrlEthAddr !== this.props.currentAddress) {
          history.push(`/${this.props.currentAddress}/${profilePage}`);
        }

        await this.props.openBox();
        if (!this.props.showErrorModal) this.getMyData();
      } else if (!this.props.isSignedIntoWallet) {
        history.push(routes.LANDING);
        this.props.handleRequireWalletLoginModal();
      }
      // else if (notSignedIn) {
      //   history.push(routes.LANDING);
      //   this.props.handleSignInModal();
      // }
    } catch (err) {
      console.error(err);
    }
  }

  handleSignInUp = async () => {
    const {
      accessDeniedModal,
    } = this.props;

    try {
      // if (window.ethereum || typeof window.web3 !== 'undefined') {
      await this.props.checkMobileWeb3(); // eslint-disable-line
      await this.props.injectWeb3(); // eslint-disable-line
      await this.props.checkNetwork(); // eslint-disable-line

      if (this.props.isSignedIntoWallet) { // eslint-disable-line
        await this.props.openBox('fromSignIn'); // eslint-disable-line
        if (!this.props.showErrorModal) this.getMyData(); // eslint-disable-line
      } else if (!this.props.isSignedIntoWallet && !accessDeniedModal) { // eslint-disable-line
        this.props.handleRequireWalletLoginModal(); // eslint-disable-line
      }
      // } else if (typeof window.web3 === 'undefined') {
      //   this.props.requireMetaMaskModal();
      //   this.props.handleMobileWalletModal();
      // }
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const {
      showDifferentNetworkModal,
      showPickProviderScreen,
      accessDeniedModal,
      errorMessage,
      allowAccessModal,
      alertRequireMetaMask,
      provideConsent,
      signInToWalletModal,
      signInModal,
      mobileWalletRequiredModal,
      directLogin,
      loggedOutModal,
      switchedAddressModal,
      prevNetwork,
      currentNetwork,
      onBoardingModal,
      onBoardingModalTwo,
      isFetchingThreeBox,
      prevAddress,
      showErrorModal,
      isLoggedIn,
      isSignedIntoWallet,
      location,
      onSyncFinished,
      isSyncing,
      hasSignedOut,
      onOtherProfilePage,
      showFollowingPublicModal,
      otherAddressToFollow,
      showContactsModal,
      otherFollowing,
      otherName,
      following,
      otherProfileAddress,
    } = this.props;

    const {
      onBoardingModalMobileOne,
      onBoardingModalMobileTwo,
      onBoardingModalMobileThree,
    } = this.state;

    const { pathname } = location;
    const normalizedPath = normalizeURL(pathname);
    const mustConsentError = errorMessage && errorMessage.message && errorMessage.message.substring(0, 65) === 'Error: MetaMask Message Signature: User denied message signature.';
    const landing = pathname === routes.LANDING ? 'landing' : '';
    const { userAgent: ua } = navigator;
    const isIOS = ua.includes('iPhone');
    const isMyProfilePath = matchProtectedRoutes(normalizedPath.split('/')[2]);

    return (
      <div className="App">
        <AppHeaders />

        {(!isMyProfilePath && !isLoggedIn) // show landing nav when user is not logged in, 3box is not fetching, and when route is not a protected route
          && (
            <NavLanding
              handleSignInUp={this.handleSignInUp}
              onOtherProfilePage={onOtherProfilePage}
              landing={landing}
              pathname={normalizedPath}
            />
          )}

        {(!isMyProfilePath && isLoggedIn) && <Nav />}

        <AppModals
          isFetchingThreeBox={isFetchingThreeBox}
          onSyncFinished={onSyncFinished}
          isSyncing={isSyncing}
          hasSignedOut={hasSignedOut}
          allowAccessModal={allowAccessModal}
          directLogin={directLogin}
          isMyProfilePath={isMyProfilePath}
          alertRequireMetaMask={alertRequireMetaMask}
          accessDeniedModal={accessDeniedModal}
          signInToWalletModal={signInToWalletModal}
          signInModal={signInModal}
          isIOS={isIOS}
          mobileWalletRequiredModal={mobileWalletRequiredModal}
          errorMessage={errorMessage}
          mustConsentError={mustConsentError}
          showErrorModal={showErrorModal}
          prevNetwork={prevNetwork}
          currentNetwork={currentNetwork}
          showDifferentNetworkModal={showDifferentNetworkModal}
          showPickProviderScreen={showPickProviderScreen}
          loggedOutModal={loggedOutModal}
          switchedAddressModal={switchedAddressModal}
          prevAddress={prevAddress}
          onBoardingModal={onBoardingModal}
          onBoardingModalTwo={onBoardingModalTwo}
          provideConsent={provideConsent}
          showContactsModal={showContactsModal}
          showFollowingPublicModal={showFollowingPublicModal}
          onBoardingModalMobileOne={onBoardingModalMobileOne}
          onBoardingModalMobileTwo={onBoardingModalMobileTwo}
          onBoardingModalMobileThree={onBoardingModalMobileThree}
          otherAddressToFollow={otherAddressToFollow}
          otherFollowing={otherFollowing}
          otherName={otherName}
          following={following}
          otherProfileAddress={otherProfileAddress}
          handleContactsModal={this.props.handleContactsModal}
          handleRequireWalletLoginModal={this.props.handleRequireWalletLoginModal}
          handleSignInModal={this.props.handleSignInModal}
          handleMobileWalletModal={this.props.handleMobileWalletModal}
          handleConsentModal={this.props.handleConsentModal}
          handleDeniedAccessModal={this.props.handleDeniedAccessModal}
          closeErrorModal={this.props.closeErrorModal}
          handleSwitchedNetworkModal={this.props.handleSwitchedNetworkModal}
          handleLoggedOutModal={this.props.handleLoggedOutModal}
          handleSignOut={this.props.handleSignOut}
          handleSwitchedAddressModal={this.props.handleSwitchedAddressModal}
          handleOnboardingModal={this.props.handleOnboardingModal}
          handleAccessModal={this.props.handleAccessModal}
          handleNextMobileModal={this.handleNextMobileModal}
          closeRequireMetaMaskModal={this.props.closeRequireMetaMaskModal}
          handleFollowingPublicModal={this.props.handleFollowingPublicModal}
          saveFollowing={this.props.saveFollowing}
        />

        <Switch>
          <Route
            exact
            path={routes.LANDING}
            render={() => (
              <LandingNew
                handleSignInUp={this.handleSignInUp}
                isLoggedIn={isLoggedIn}
                errorMessage={errorMessage}
                showErrorModal={showErrorModal}
                isSignedIntoWallet={isSignedIntoWallet}
              />
            )}
          />

          <Route
            path={routes.API}
            render={() => (
              <APIs
                handleSignInUp={this.handleSignInUp}
                isLoggedIn={isLoggedIn}
                errorMessage={errorMessage}
                showErrorModal={showErrorModal}
                isSignedIntoWallet={isSignedIntoWallet}
              />
            )}
          />

          <Route
            exact
            path={routes.HUB}
            render={() => (
              <Dapp
                handleSignInUp={this.handleSignInUp}
                isLoggedIn={isLoggedIn}
                errorMessage={errorMessage}
                showErrorModal={showErrorModal}
                isSignedIntoWallet={isSignedIntoWallet}
              />
            )}
          />

          <Route
            exact
            path={routes.CAREERS}
            render={() => <Careers />}
          />

          <Route
            exact
            path={routes.TEAM}
            render={() => <Team />}
          />

          <Route
            exact
            path={routes.JOBS}
            render={() => <Redirect to={routes.CAREERS} />}
          />

          <Route
            exact
            path="(^[/][0][xX]\w{40}\b)/activity"
            component={MyProfile}
          />
          <Redirect from="/profile" to="/" />
          <Redirect from="/editprofile" to="/" />

          <Route
            exact
            path="(^[/][0][xX]\w{40}\b)/details"
            component={MyProfile}
          />

          <Route
            exact
            path="(^[/][0][xX]\w{40}\b)/collectibles"
            component={MyProfile}
          />

          <Route
            exact
            path="(^[/][0][xX]\w{40}\b)/following"
            component={MyProfile}
          />

          <Route
            exact
            path="(^[/][0][xX]\w{40}\b)/data"
            component={Spaces}
          />

          <Route
            exact
            path="(^[/][0][xX]\w{40}\b)/edit"
            component={EditProfile}
          />

          <Route
            exact
            path={routes.PARTNERS}
            component={() => (
              <Partners />
            )}
          />

          <Route
            exact
            path={routes.PRIVACY}
            component={() => (
              <Privacy />
            )}
          />

          <Route
            exact
            path={routes.TERMS}
            component={() => (
              <Terms />
            )}
          />

          <Route
            path={routes.CREATE}
            exact
            component={() => (
              <Create
                isLoggedIn={isLoggedIn}
                handleSignInUp={this.handleSignInUp}
              />
            )}
          />

          <Route
            exact
            path="(^[/][0][xX]\w{40}\b)"
            component={PubProfile}
          />

          <Route
            component={() => (
              <NoMatch
                isLoggedIn={isLoggedIn}
                handleSignInUp={this.handleSignInUp}
              />
            )}
          />

        </Switch>

      </div>
    );
  }
}

App.propTypes = {
  openBox: PropTypes.func.isRequired,
  injectWeb3: PropTypes.func.isRequired,
  getMyProfileValue: PropTypes.func.isRequired,
  checkMobileWeb3: PropTypes.func.isRequired,
  getMyFollowing: PropTypes.func.isRequired,
  getMyDID: PropTypes.func.isRequired,
  getCollectibles: PropTypes.func.isRequired,
  getMySpacesData: PropTypes.func.isRequired,
  convert3BoxToSpaces: PropTypes.func.isRequired,
  getMyMemberSince: PropTypes.func.isRequired,
  getVerifiedPublicGithub: PropTypes.func.isRequired,
  getVerifiedPublicTwitter: PropTypes.func.isRequired,
  getVerifiedPrivateEmail: PropTypes.func.isRequired,
  getActivity: PropTypes.func.isRequired,
  requireMetaMaskModal: PropTypes.func.isRequired,
  handleMobileWalletModal: PropTypes.func.isRequired,
  handleSwitchedNetworkModal: PropTypes.func.isRequired,
  handleAccessModal: PropTypes.func.isRequired,
  closeRequireMetaMaskModal: PropTypes.func.isRequired,
  handleConsentModal: PropTypes.func.isRequired,
  handleDeniedAccessModal: PropTypes.func.isRequired,
  handleRequireWalletLoginModal: PropTypes.func.isRequired,
  handleSignInModal: PropTypes.func.isRequired,
  handleSignOut: PropTypes.func,
  checkNetwork: PropTypes.func.isRequired,
  closeErrorModal: PropTypes.func.isRequired,
  handleLoggedOutModal: PropTypes.func.isRequired,
  handleSwitchedAddressModal: PropTypes.func.isRequired,
  getMyFollowing: PropTypes.func.isRequired,
  handleOnboardingModal: PropTypes.func.isRequired,
  saveFollowing: PropTypes.func.isRequired,

  showDifferentNetworkModal: PropTypes.bool,
  showPickProviderScreen: PropTypes.bool,
  onSyncFinished: PropTypes.bool,
  hasSignedOut: PropTypes.bool,
  isSyncing: PropTypes.bool,
  accessDeniedModal: PropTypes.bool,
  errorMessage: PropTypes.string,
  allowAccessModal: PropTypes.bool,
  alertRequireMetaMask: PropTypes.bool,
  provideConsent: PropTypes.bool,
  signInToWalletModal: PropTypes.bool,
  signInModal: PropTypes.bool,
  mobileWalletRequiredModal: PropTypes.bool,
  showErrorModal: PropTypes.bool,
  directLogin: PropTypes.string,
  isLoggedIn: PropTypes.bool,
  isSignedIntoWallet: PropTypes.bool,
  loggedOutModal: PropTypes.bool,
  switchedAddressModal: PropTypes.bool,
  onBoardingModal: PropTypes.bool,
  onBoardingModalTwo: PropTypes.bool,
  isFetchingThreeBox: PropTypes.bool,
  showContactsModal: PropTypes.bool,
  onOtherProfilePage: PropTypes.bool,
  prevNetwork: PropTypes.string,
  currentNetwork: PropTypes.string,
  currentAddress: PropTypes.string,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  prevAddress: PropTypes.string,
  otherAddressToFollow: PropTypes.string,
};

App.defaultProps = {
  showDifferentNetworkModal: false,
  showPickProviderScreen: false,
  handleSignOut,
  accessDeniedModal: false,
  onSyncFinished: false,
  hasSignedOut: false,
  onOtherProfilePage: false,
  isSyncing: false,
  showContactsModal: false,
  errorMessage: '',
  allowAccessModal: false,
  alertRequireMetaMask: false,
  provideConsent: false,
  signInToWalletModal: false,
  signInModal: false,
  mobileWalletRequiredModal: false,
  showErrorModal: false,
  loggedOutModal: false,
  switchedAddressModal: false,
  onBoardingModal: false,
  onBoardingModalTwo: false,
  isFetchingThreeBox: false,
  isLoggedIn: false,
  isSignedIntoWallet: false,
  prevNetwork: '',
  currentNetwork: '',
  prevAddress: '',
  directLogin: '',
  currentAddress: '',
  otherAddressToFollow: '',
};

const mapState = state => ({
  showDifferentNetworkModal: state.uiState.showDifferentNetworkModal,
  showPickProviderScreen: state.uiState.showPickProviderScreen,
  allowAccessModal: state.uiState.allowAccessModal,
  alertRequireMetaMask: state.uiState.alertRequireMetaMask,
  provideConsent: state.uiState.provideConsent,
  signInToWalletModal: state.uiState.signInToWalletModal,
  signInModal: state.uiState.signInModal,
  mobileWalletRequiredModal: state.uiState.mobileWalletRequiredModal,
  directLogin: state.uiState.directLogin,
  loggedOutModal: state.uiState.loggedOutModal,
  switchedAddressModal: state.uiState.switchedAddressModal,
  onBoardingModal: state.uiState.onBoardingModal,
  onBoardingModalTwo: state.uiState.onBoardingModalTwo,
  isFetchingThreeBox: state.uiState.isFetchingThreeBox,
  errorMessage: state.uiState.errorMessage,
  prevAddress: state.uiState.prevAddress,
  showErrorModal: state.uiState.showErrorModal,
  accessDeniedModal: state.uiState.accessDeniedModal,
  onOtherProfilePage: state.uiState.onOtherProfilePage,
  showFollowingPublicModal: state.uiState.showFollowingPublicModal,
  showContactsModal: state.uiState.showContactsModal,

  onSyncFinished: state.userState.onSyncFinished,
  isSyncing: state.userState.isSyncing,
  hasSignedOut: state.userState.hasSignedOut,
  prevNetwork: state.userState.prevNetwork,
  currentNetwork: state.userState.currentNetwork,
  isLoggedIn: state.userState.isLoggedIn,
  isSignedIntoWallet: state.userState.isSignedIntoWallet,
  currentAddress: state.userState.currentAddress,

  otherAddressToFollow: state.otherProfile.otherAddressToFollow,

  otherFollowing: state.otherProfile.otherFollowing,
  otherName: state.otherProfile.otherName,
  following: state.myData.following,
  otherProfileAddress: state.otherProfile.otherProfileAddress,
});

export default withRouter(connect(mapState,
  {
    openBox,
    injectWeb3,
    checkMobileWeb3,
    checkNetwork,
    getMyProfileValue,
    getMyDID,
    getCollectibles,
    getMySpacesData,
    convert3BoxToSpaces,
    getMyMemberSince,
    getVerifiedPublicGithub,
    getVerifiedPublicTwitter,
    getVerifiedPrivateEmail,
    getActivity,
    getMyFollowing,
    requireMetaMaskModal,
    handleMobileWalletModal,
    handleSignInModal,
    handleRequireWalletLoginModal,
    handleSwitchedNetworkModal,
    handleAccessModal,
    handleConsentModal,
    handleDeniedAccessModal,
    handleLoggedOutModal,
    handleSignOut,
    handleSwitchedAddressModal,
    handleOnboardingModal,
    handleFollowingPublicModal,
    closeErrorModal,
    closeRequireMetaMaskModal,
    getMyFollowing,
    saveFollowing,
    handleContactsModal,
  })(App));
