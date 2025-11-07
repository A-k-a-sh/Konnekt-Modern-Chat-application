
const RightTop = () => {
  const { MsgAreaDivRef, isMsgSelected, setIsMsgSelected, setSelectedMsg, selectedMsg } = useRightContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [forwardModalOpen, setForwardOpen] = useState(false)




  // console.log('in right top:', open);
  const { selectedUser, userInfo, isOnline, setIsOnline, selectedGroup } = useAllContext()

  useIsOnline(selectedUser, userInfo, setIsOnline)



  return (
    <div
      className=' h-full w-full flex items-center bg-blue-600/10 backdrop-blur-md  '
    >

      {!isMsgSelected ? (
        <div
          className=' max-h-3/4    max-w-64    zinc-700 px-4  rounded-lg hover:bg-zinc-600 duration-500 cursor-pointer  flex flex-row gap-4  justify-start items-center'
          onClick={() => setModalOpen(true)}
        >

          <div className='relative'>
            <img className='w-12 h-12 rounded-full' src={info.selectedGroup?.groupImage || info.profilePhoto} alt="" />

            <div className='absolute -bottom-1 -right-1 '>
              <i className={`fa-solid fa-circle pr-1 ${isOnline ? 'text-green-400' : 'text-zinc-400'} `}></i>
            </div>
          </div>

          <div className='flex  flex-col jucent-center  '>
            <p>{selectedUser.userName || info.selectedGroup?.groupName} </p>
          </div>




        </div>

      ) : (
        <div className='flex flex-row justify-between items-center  px-2 w-full'>

          <div className='flex flex-row gap-4 px-2 '>
            <div 
              className=' bg-gray-500/30 px-3 py-2 rounded-lg flex flex-row items-center hover:bg-gray-500/65 cursor-pointer duration-150'
              onClick={()=> setDeleteModalOpen(true)}
            >
              <i className="fa-solid fa-trash px-2 py-1   w-fit h-fit"></i>
              <p>Delete</p>
            </div>

            <div className='bg-gray-500/30 px-3 py-2 rounded-lg flex flex-row items-center hover:bg-gray-500/65 cursor-pointer duration-150'>
              <i className={`fa-solid fa-share px-2 py-1 rounded-full hover:bg-gray-600 w-fit h-fit `}></i>
              <p>Forward</p>
            </div>

          </div>
          <div className='flex flex-row gap-3 items-center  mr-3'>
            <p>{selectedMsg?.length} Message selected</p>


            <div
              className='flex flex-row gap-3 items-center px-3 cursor-pointer rounded-lg py-1 hover:bg-gray-600/80'
              onClick={() => {
                setSelectedMsg([])

              }}
            >
              <i class="fa-solid fa-xmark"></i>
              <p>Cancel</p>
            </div>
          </div>

        </div>

      )}


      <div className=''>

        <ModalDelSelectedMsg
         deleteModalOpen={deleteModalOpen}
         setDeleteModalOpen={setDeleteModalOpen}

        />
        
      </div>



    </div>
  )
}

export default RightTop