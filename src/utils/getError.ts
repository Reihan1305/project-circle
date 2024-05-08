import { AxiosError } from "axios";

export default function getError (error :unknown){
    let errorMessage:string = "unknown error"
    
    if(error instanceof AxiosError){
        if(error.message){
            errorMessage = error.response?.data.message
        }else{
            errorMessage = error.message
        }
    }
    return errorMessage
}