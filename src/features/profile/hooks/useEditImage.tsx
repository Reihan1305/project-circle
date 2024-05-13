import { useState } from "react";
import { API } from "@/utils/api";
import { toast } from "react-toastify";
import getError from "@/utils/getError";
import { useAppSelectore } from "@/redux/store";

type imageFormI = {
    image:File | null
}
export function useEditImage (){
    const detailUser:any = useAppSelectore((state) => state.detailUser);
    const [, setPhotoprofile] = useState<string | null >(null)
    const [image,setImage] = useState<imageFormI>({image:null})
    const [, setIsLoading] = useState<boolean>(false);
    const [, setIsError] = useState<boolean>(false);
    const [, setError] = useState<string>("");
    const [, setIsEditProfileSuccess] =useState<boolean>(false);
    const formData = new FormData()

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      try{
        const jwtToken = localStorage.getItem('jwtToken')
        const idUser = detailUser.data?.id;
        const file = e.target.files && e.target.files[0];
        if (file) {
          setImage({
            image: file,
          });
          formData.append("image", file)
          const reader = new FileReader();
          reader.onload = () => {
            const dataURL = reader.result as string;
            setPhotoprofile(dataURL);
          };
          reader.readAsDataURL(file);
        }
        setIsLoading(true);
            const response = await API.put(`uploadprofilepicture/${idUser}`,formData ,{
              headers :{Authorization:`Bearer ${jwtToken}`}
            })
            console.log(response)
            toast.success(response.data.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
              setIsError(false);
              setError("");
              setIsEditProfileSuccess(true);
        }catch(error){
            setIsError(true);
            setError(getError(error));
        }finally{
            setIsLoading(false)
        }
        };
        return {
            handleImageChange
        }
}

