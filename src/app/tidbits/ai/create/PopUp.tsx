'use client';
import SingleSectionModal from "@/components/core/modals/SingleSectionModal"
import CustomButton from "@/components/core/buttons/Button"

import { useRouter } from 'next/router';
import Link from "next/link";

const PopUp = () => {
  
  const router = useRouter();

  const handleClose = () => {
    // Logic to close the modal and return to the previous page
    router.back(); // Go back to the previous page
  };

 


  return (

    <SingleSectionModal open={true} title="Generate Bytes" onClose={handleClose} >
        <div className="flex m-2 justify-between">
        {/* We can also router.Push("Specified Page") instead of using link we can pass this on OnClick https://nextjs.org/docs/app/api-reference/functions/use-router */}
        <CustomButton variant="outlined" removeBorder={false} > <Link href="/" className="no-underline "> New Byte </Link></CustomButton>
        <CustomButton variant="outlined" removeBorder={false}><Link href="/" className="no-underline "> Byte By AI </Link></CustomButton>
            
        </div>


    </SingleSectionModal>
  )
}

export default PopUp;