'use strict';

/**
 * This function allow user to delete Record(s) inside Salesforce
 * Reference: https://jsforce.github.io/document/#delete
 */

const SERVERLESS_FILE_PATH = '/sfdc/crud/delete';
 
/**
 * Twilio calls this method
 * @param {Object} context 
 * @param {Object} event 
 * @param {Function} callback
 * @returns {Object} 
 */
exports.handler = async (context, event, callback) => {
  try {
    const twilioClient = context.getTwilioClient();
    const serverlessHelper = loadServerlessModules();
    const result = await driver(context, event, serverlessHelper, twilioClient);
    return callback(null, result);
  } catch (e) {
    return callback(e);
  }
};

/**
 * Loads up related helper methods.
 */
const loadServerlessModules = () => {
  try {
    const functions = Runtime.getFunctions();
    const serverlessHelperPath = functions['sfdc/helpers/index'].path;
    const serverlessHelper = require(serverlessHelperPath);
    return serverlessHelper;
  } catch (e) {
    throw e;
  }
}

/**
 * Main Driver of the Twilio Serverless Function
 * @param {Object} serverlessContext 
 * @param {Object} serverlessEvent 
 * @param {Object} serverlessHelper 
 * @param {Object} twilioClient 
 * @returns {Object}
 */
const driver = async (serverlessContext, serverlessEvent, serverlessHelper, twilioClient) => {
  try {
    const actionType = serverlessHelper.sfdc.constants.ACTION_SOBJECT_DELETE;
    const valid = serverlessHelper.sfdc.validator.isValidPayload(
      serverlessContext,
      serverlessEvent,
      serverlessHelper,
      actionType
    );
    
    if(!valid.isValid) {
      throw new Error(valid.errorMsg);
    }

    const sfdcConnection = await serverlessHelper.sfdc.cache.getSFDCConnection(
      serverlessContext, 
      serverlessHelper, 
      twilioClient
    );

    const result = serverlessHelper.sfdc.action.driver(
      serverlessContext, 
      serverlessEvent, 
      serverlessHelper,
      sfdcConnection,
      actionType
    );
    
    return result;
  } catch (e) {
    throw serverlessHelper.devtools.formatErrorMsg(serverlessContext, SERVERLESS_FILE_PATH, 'driver', e);
  }
}