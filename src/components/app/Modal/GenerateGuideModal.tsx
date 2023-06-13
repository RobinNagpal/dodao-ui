import React, { useState } from 'react'
import Modal from '@/components/app/Modal';
import styled from 'styled-components';
import StyledTextareaAutosize from '../TextArea/StyledTextareaAutosize';
import Button from '@/components/app/Button';

interface GenerateGuideProps {
    open: boolean;
    onClose: () => void;

}


const ModalHeader = styled.h3`
  /* Custom styles if needed */
`;

const GenerateGuideModal = ({ open, onClose }: GenerateGuideProps) => {

    const [content, setContent] = useState('')
    const [directions, setDirections] = useState('')

    function handleSubmit() {

        console.log(content);
        console.log(directions);
        // We can make post request from the data 
        // fetch("post","route")
        onClose()
    }

    return (

        <Modal open={open} className='min-w-[70%] min-h-max' onClose={onClose}>
            <ModalHeader className=" p-4 text-center font-bold text-2xl">Generate Guide</ModalHeader>

            <div className='flex flex-col gap-6 px-8 py-4'>
                <StyledTextareaAutosize
                    className=''
                    placeholder='Paste all the content and the links from which you want to generate the guides'
                    minHeight={250}
                    onUpdate={(value)=>setContent(value?.toString()!)}
                    modelValue={content}
                ></StyledTextareaAutosize>

                <StyledTextareaAutosize
                    placeholder='Paste all the content and the links from which you want to generate the guides'
                    onUpdate={(value) => setDirections(value?.toString()!)}
                    modelValue={directions}
                ></StyledTextareaAutosize>

                <div
                    className=' min-w-full w-screen'
                >

                </div>

                {/* <div className='flex justify-center'> */}
                <Button className='max-w-fit mx-auto' onClick={handleSubmit}>
                    Generate
                </Button>
                {/* </div> */}

            </div>


        </Modal>

    )
}

export default GenerateGuideModal