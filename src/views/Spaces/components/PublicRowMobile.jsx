import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Private from '../../../assets/PrivateActivity.svg';
import Globe from '../../../assets/Globe.svg';
import Verified from '../../../assets/Verified.svg';
import '../styles/Spaces.css';

import actions from '../../../state/actions';

const { viewSpaceItem } = actions.spaces;

const PublicRowMobile = ({
  dataKey,
  dataValue,
  spaceName,
  rowType,
  privacy,
  viewSpaceItem,
}) => (
    <div
      className={`data__items__row ${rowType}_row`}
      key={dataKey}
      onClick={() => viewSpaceItem(true, false, false, dataKey, dataValue, spaceName, rowType, privacy)}
      role="button"
      onKeyPress={() => viewSpaceItem(true, false, false, dataKey, dataValue, spaceName, rowType, privacy)}
      tabIndex={0}
    >
      <div className="data__items--namewrapper">
        <div className="data__name">
          <p className="data__items__spacename">
            {spaceName}
          </p>
          <p>
            {(dataKey && dataKey.substring(0, 14) !== 'follow-thread-') && dataKey.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())}

            {(dataKey && dataKey.substring(0, 14) === 'follow-thread-')
              && 'Thread'}
          </p>
        </div>

        <div className="data__items__context">
          <span className={`type__tag ${rowType}`}>
            <p className="spaceRow__tag__text">
              {rowType}
            </p>
          </span>

          {privacy === 'private'
            ? <img src={Private} alt="Transaction Icon" className="data__items__privacyicon" />
            : <img src={Globe} alt="Transaction Icon" className="data__items__privacyicon" />
          }
          {/* Feb 19, 2019 */}
        </div>
      </div>
      <div className="data__items--detailswrapper">
        <div className="data__content">
          {(dataKey && dataKey.substring(0, 14) === 'follow-thread-')
            && (
              <p className="data__text">
                {dataValue.name.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
              </p>)
          }

          {typeof dataValue === 'string' && (
            dataValue
          )}

          {(typeof dataValue === 'object' && rowType !== 'Image' && !Array.isArray(dataValue) && dataKey.substring(0, 14) !== 'follow-thread-') && (
            Object.keys(dataValue).map(item => (item))
          )}

          {(rowType !== 'Image' && Array.isArray(dataValue)) && (
            'Array'
          )}

          {(Array.isArray(dataValue) && rowType !== 'Image') && (
            dataValue.map((item) => {
              if (Array.isArray(item)) return item[0];
              if (typeof item === 'object') return Object.keys(item)[0];
              return item;
            })
          )}

          {(Array.isArray(dataValue) && dataKey === 'collectiblesFavoritesToRender') && (
            <React.Fragment>
              {
                dataValue.map(item => (
                  <img src={item.image_preview_url} alt="" className="data__collectibles__tile" />
                ))
              }
            </React.Fragment>
          )}

          {rowType === 'Image' && (
            <img
              src={`https://ipfs.infura.io/ipfs/${dataValue[0].contentUrl['/']}`}
              alt=""
              className="spaceRow__content__image"
            />
          )}

          {rowType === 'Claim' && (
            <React.Fragment>
              <img
                src={Verified}
                alt="Verified"
                className="profile__category__verified__icon"
              />
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );

PublicRowMobile.propTypes = {
  dataValue: PropTypes.object.isRequired,
  viewSpaceItem: PropTypes.func.isRequired,
  dataKey: PropTypes.string.isRequired,
  spaceName: PropTypes.string.isRequired,
  rowType: PropTypes.string.isRequired,
  privacy: PropTypes.string.isRequired,
};

export default connect('', { viewSpaceItem })(PublicRowMobile);