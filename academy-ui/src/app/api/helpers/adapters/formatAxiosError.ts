export function formatAxiosError(error: any) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return { data: error.response.data, status: error.response.status, headers: error.response.headers };
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    return { request: error.request };
  } else {
    // Something happened in setting up the request that triggered an Error
    return { message: error.message };
  }
}
