import type { MyPage } from "@/components/layouts/layoutTypes";
import { getServerAuthSession } from "@/server/auth";
import { useRouter } from "next/router";
import { type GetServerSideProps } from "next";
import DivisionForm from "@/components/forms/DivisionForm";
import type { FormSlugType } from "@/types/global";
import Head from "next/head";
import React from "react";

const title = "Division Form";

const ChartOfAccountFormSlugPage: MyPage = () => {
  const router = useRouter();
  const slug = router.query.slug;

  return (
    <>
      <Head>
        <title>{`CRUD Test | ${title}`}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <DivisionForm slug={slug as FormSlugType} showIn="page" />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default ChartOfAccountFormSlugPage;
ChartOfAccountFormSlugPage.Layout = "Dashboard";
