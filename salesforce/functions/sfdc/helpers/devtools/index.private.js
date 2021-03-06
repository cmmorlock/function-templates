'use strict';

const formatErrorMsg = (serverlessContext, filePath, functionName, error) => {
  const isStackTrace = (serverlessContext.DEV_TOOLS_STACK_TRACE === 'true') ?
    true : false;
  
  let result = error;

  if(isStackTrace) {
    result = `\n
    File Path: ${filePath} \n 
    Function Name: ${functionName} \n 
    Error Message: ${error} \n
    \n`;
  }
  return result;
}

module.exports = {formatErrorMsg};