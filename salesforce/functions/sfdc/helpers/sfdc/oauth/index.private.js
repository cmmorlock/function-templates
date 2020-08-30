'use strict';

/**
 * Load Modules
 */

const jsforce = require('jsforce');

const {getJWTToken} = require('salesforce-jwt-promise');

const fs = require('fs');

/**
 * SERVERLESS FILE BOLIER PLATE
 */
const SERVERLESS_FILE_PATH = '/sfdc/helpers/sfdc/connection/index';

/**
 * Oauth 2.0 User - Agent
 * @param {Object} serverlessContext 
 * @param {Object} serverlessHelper
 * @returns {Object} 
 */
const ouathSFDCByUserAgent = async(serverlessContext, serverlessHelper) => {
  try {
    const conn = new jsforce.Connection({
      oauth2 : {
        loginUrl : serverlessContext.SFDC_LOGIN_URL,
        clientId : serverlessContext.SFDC_CONNECTED_APP_CONSUMER_KEY,
        clientSecret : serverlessContext.SFDC_CONNECTED_APP_CONSUMER_SECRET,
        redirectUri : serverlessContext.SFDC_CONNECTED_APP_CALLBACK_URL
      }
    });
  
    await conn.login(
      serverlessContext.SFDC_USERNAME, 
      serverlessContext.SFDC_PASSWORD + serverlessContext.SFDC_SECURITY_TOKEN
    );
    const result = {
      'accessToken': conn.accessToken,
      'instanceUrl': conn.instanceUrl
    };
    return result;
  } catch(e) {
    throw serverlessHelper.devtools.formatErrorMsg(serverlessContext, '/sfdc/helpers/sfdc/oauth/index/ouathSFDCByUserAgent', e);
  }
}

/**
 * Load SFDC Private Key from Twilio Assets.
 * @param {Object} serverlessContext 
 * @param {Object} serverlessHelper 
 * @returns {Object}
 */
const getSFDCPrivateKey = (serverlessContext, serverlessHelper) => {
  try {
    const {SFDC_PRIVATE_KEY_PATH} = serverlessContext;
    const SFDCPrivateKeySystemPath = Runtime.getAssets()[SFDC_PRIVATE_KEY_PATH].path;
    const SFDCPrivateKey = fs.readFileSync(SFDCPrivateKeySystemPath, 'utf-8');
    return SFDCPrivateKey;
  } catch (e) {
    throw serverlessHelper.devtools.formatErrorMsg(serverlessContext, '/sfdc/helpers/sfdc/oauth/index/getSFDCPrivateKey', e);
  }
}

/**
 * Generate a JWT Token
 * @param {Object} serverlessContext 
 * @param {String} privateKey 
 * @returns {Object}
 */
const generateJWTToken = async(serverlessContext, serverlessHelper, privateKey) => {
  try {
    const {SFDC_CONNECTED_APP_CONSUMER_KEY, SFDC_USERNAME, SFDC_LOGIN_URL} = serverlessContext;
    const jwtResponse = await getJWTToken({
      clientId: SFDC_CONNECTED_APP_CONSUMER_KEY,
      privateKey: privateKey,
      userName: SFDC_USERNAME,
      audience: SFDC_LOGIN_URL
    });
    return jwtResponse;
  } catch(e) {
    throw serverlessHelper.devtools.formatErrorMsg(serverlessContext, '/sfdc/helpers/sfdc/oauth/index/getJWTToken', e);
  }
}

const ouathSFDCByServerToServer = async(serverlessContext, serverlessHelper) => {
  try {
    const privateKey = getSFDCPrivateKey(serverlessContext, serverlessHelper);
    const jwtResponse = await generateJWTToken(serverlessContext, serverlessHelper, privateKey);
    return jwtResponse;
  } catch(e) {
    throw serverlessHelper.devtools.formatErrorMsg(serverlessContext, '/sfdc/helpers/sfdc/oauth/index', e);
  }
}


module.exports = {ouathSFDCByUserAgent, ouathSFDCByServerToServer};