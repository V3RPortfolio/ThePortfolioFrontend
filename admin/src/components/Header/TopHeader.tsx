import BreadCrumb from "./BreadCrumb";

const TopHeader: React.FC<{className?: string}> = ({className}) => {
    return <header className={`bg-[var(--color-background)] w-[1] ${className}`}>
        <BreadCrumb pageTitle="Dashboard" navigationLinks={[
            {
                label: 'Dashboard',
                href: '/'

            }
        ]} />
    </header>
}

export default TopHeader;