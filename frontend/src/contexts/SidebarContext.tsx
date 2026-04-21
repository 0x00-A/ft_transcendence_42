// import {
//   createContext,
//   useState,
//   useContext,
//   PropsWithChildren,
//   SetStateAction,
//   Dispatch,
// } from 'react';

// interface SidebarContextType {
//   open: boolean | null;
//   setOpen: Dispatch<SetStateAction<boolean>>;
// }
// // Create the context
// const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// // provider component
// export const SidebarProvider = ({ children }: PropsWithChildren) => {
//   // const [activeLink, setActiveLink] = useState(0);
//   const [open, setOpen] = useState(true);

//   return (
//     <SidebarContext.Provider value={{ open, setOpen }}>
//       {children}
//     </SidebarContext.Provider>
//   );
// };

// // custom hook for easy access to the context
// // export const useSidebar = () => useContext(SidebarContext);
// export const useSidebar = (): SidebarContextType => {
//   const context = useContext(SidebarContext);
//   if (!context) {
//     throw new Error('useSidebar must be used within a SidebarProvider');
//   }
//   return context;
// };
