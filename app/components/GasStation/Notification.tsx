import { Loading } from "@/app/components/icons";
import { composeEclipsescanUrl, composeEtherscanCompatibleTxPath, useNetwork } from "@/app/contexts/NetworkContext";
import { assertNever } from "@/lib/typeUtils";
import { PropsWithChildren } from "react";

export enum TxStatus {
  Waiting,
  Confirmed,
  Failed,
  None
}

const DoneIcon: React.FC = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM13.774 8.1333C14.1237 7.70582 14.0607 7.0758 13.6332 6.72607C13.2058 6.37635 12.5758 6.43935 12.226 6.86679L8.4258 11.5116L7.20711 10.2929C6.81658 9.9024 6.18342 9.9024 5.79289 10.2929C5.40237 10.6834 5.40237 11.3166 5.79289 11.7071L7.79289 13.7071C7.99267 13.9069 8.2676 14.0129 8.5498 13.9988C8.832 13.9847 9.095 13.8519 9.274 13.6333L13.774 8.1333Z" fill="#74FF71"/>
    </svg>
  );
}

const FailedIcon: React.FC = () => {
  return (
    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 12C2.5 6.47715 6.97715 2 12.5 2C18.0228 2 22.5 6.47715 22.5 12C22.5 17.5228 18.0228 22 12.5 22C6.97715 22 2.5 17.5228 2.5 12ZM10.2071 8.29289C9.81658 7.90237 9.18342 7.90237 8.79289 8.29289C8.40237 8.68342 8.40237 9.31658 8.79289 9.70711L11.0858 12L8.79289 14.2929C8.40237 14.6834 8.40237 15.3166 8.79289 15.7071C9.18342 16.0976 9.81658 16.0976 10.2071 15.7071L12.5 13.4142L14.7929 15.7071C15.1834 16.0976 15.8166 16.0976 16.2071 15.7071C16.5976 15.3166 16.5976 14.6834 16.2071 14.2929L13.9142 12L16.2071 9.70711C16.5976 9.31658 16.5976 8.68342 16.2071 8.29289C15.8166 7.90237 15.1834 7.90237 14.7929 8.29289L12.5 10.5858L10.2071 8.29289Z" fill="#D87C30"/>
    </svg>
  );
}

interface NotificationProps extends PropsWithChildren {
  type: 'pending' | 'success' | 'error' | undefined
  title: string
  classNames?: string
}

const NOTIFICATION_TYPE_TO_ICON: Record<Exclude<NotificationProps['type'], undefined>, React.ReactNode> = {
  'pending': <Loading style={{color: "rgba(161, 254, 160, 1)"}} loadingClassName="" />,
  'error': <FailedIcon />,
  'success':  <DoneIcon />
}

export const Notification: React.FC<NotificationProps> = ({type, title, children, classNames = ''}) => {
  return (
    <div className={"flex rounded-[70px] items-center gap-[10px] border-[1px] border-[#ffffff1a] px-[15px] py-[10px] " + classNames}>
      {type && NOTIFICATION_TYPE_TO_ICON[type]}
      <span className="text-white text-[16px] font-medium">{ title }</span>
      {children}
    </div>
  )
}

export const GasStationNotification: React.FC<{ txState: string, txStatus: TxStatus, txId: string}> = ({ txState, txStatus, txId }) => {
  const { selectedOption } = useNetwork()

  let type: NotificationProps['type']
  switch (txStatus) {
    case TxStatus.Waiting: {
      type = 'pending'
      break
    }
    case TxStatus.Confirmed: {
      type = 'success'
      break
    }
    case TxStatus.Failed: {
      type = 'error'
      break
    }
    case TxStatus.None: {
      type = undefined
      break
    }
    default: {
      assertNever(txStatus)
    }
  }

  return (
    <Notification type={type} title={txState} classNames="mt-[-111px] bg-[#ffffff0d] h-[46px]">
    { txId &&
      <a className="text-[#ffffff4d] text-[16px] font-medium transition-all hover:text-[#4779ff]" href={composeEclipsescanUrl(selectedOption, composeEtherscanCompatibleTxPath(txId))} target="_blank">
        View Txn
      </a>
    }
    </Notification>
  )
}
