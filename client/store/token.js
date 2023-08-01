import axios from "axios"

const access = (state='', action) => {
    if(action.type === 'SET_ACCESS_TOKEN'){
        return action.token
    }
    return state
}

export const getAccess = (authToken) => {
    return async(dispatch) => {
        const token = (await axios.get('/plaid/api/access_token', {
            headers: {
                authorization: authToken
            }
        })).data
        dispatch({type: 'SET_ACCESS_TOKEN', token})
    }
} 

export const removeAccess = () => {
    return async(dispatch) => {
        const token = ''
        dispatch({type: 'SET_ACCESS_TOKEN', token})
    }
} 

export default access;