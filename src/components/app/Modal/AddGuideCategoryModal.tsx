import React,{useState} from 'react'
import Modal from '@/components/app/Modal';
import styled from 'styled-components';
import Button from '@/components/app/Button';
import { GuideCategoryType } from '@/types/deprecated/models/enums';




const ModalHeader = styled.h3`
          /* Custom styles if needed */
          `;

interface GuideCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onAddInput: (value: GuideCategoryType) => void;
}

const AddGuideCategoryModal = ({ open, onClose, onAddInput }: GuideCategoryModalProps) => {


    const [selectedButtons, setSelectedButtons] = useState([]);

    // const selectButton = (buttonIndex:number) => {
    //     if (selectedButtons.includes(buttonIndex)) {
    //         // Deselect the button
    //         setSelectedButtons(selectedButtons.filter((index:number) => index !== buttonIndex));
    //     } else {
    //         // Select the button
    //         setSelectedButtons([...selectedButtons, buttonIndex]);
    //     }
    // };


    function addInput(inputType: GuideCategoryType) {
        onAddInput(inputType)
        onClose()
    }



    return (
        <Modal open={open} onClose={onClose}>

            <ModalHeader className=' p-4 text-center font-bold text-2xl' >Select Categories</ModalHeader>

            <div className="m-4 space-y-2  max-h-[50%] overflow-scroll">
                <p>select upto two categories</p>

                {
                    Object.values(GuideCategoryType).map((i) =>

                        <Button key={i} className="button-outline w-full flex justify-center items-center" onClick={() => addInput(i)} >
                            {i}
                        </Button>)
                }


            </div>
            <div className='flex'>
                <button>
                    cancel
                </button>
                <button>
                    confirm
                </button>
            </div>

        </Modal>
    )
}

export default AddGuideCategoryModal