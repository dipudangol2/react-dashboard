import React from 'react';
import { Outlet, redirect } from 'react-router';
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { NavItems } from 'components';
import { MobileSidebar } from 'components';
import { account } from '~/appwrite/client';
import { getExistingUser, storeUserData } from '~/appwrite/auth';

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) return redirect('/sign-in');

    let existingUser = await getExistingUser(user.$id);

    //?Check if user exists in the database, if not store user data
    if (!existingUser) {
      await storeUserData();
      existingUser = await getExistingUser(user.$id);
    }

    //?Check role of the user
    if (existingUser?.status === 'user') {
      return redirect('/');
    }
    return existingUser?.$id ? existingUser : await storeUserData();

  } catch (error) {
    console.log("Error in client loader: ", error);
    return redirect('/sign-in');

  }
}


const AdminLayout = () => {
  return (
    <div className='admin-layout'>
      <MobileSidebar />
      <aside className='w-full max-w-[270px] hidden lg:block'>
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>
      <aside className='children'>
        <Outlet />
      </aside>
    </div>
  )
}

export default AdminLayout