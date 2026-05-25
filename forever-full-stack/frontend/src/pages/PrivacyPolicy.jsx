import React from 'react'
import Title from '../components/Title'

const PrivacyPolicy = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'PRIVACY'} text2={'POLICY'} />
      </div>

      <div className='max-w-4xl mx-auto my-10 text-sm text-gray-600 flex flex-col gap-6'>
        <p>
          Kiddy Vogue values your privacy and is committed to protecting the personal
          information you share with us while using our website and services.
        </p>

        <div className='flex flex-col gap-2'>
          <b className='text-gray-800'>Information We Collect</b>
          <p>
            We may collect your name, email address, phone number, shipping address,
            and order details when you place an order, create an account, or contact us.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <b className='text-gray-800'>How We Use Your Information</b>
          <p>
            Your information is used to process orders, deliver products, provide customer
            support, improve our services, and share important updates related to your purchase.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <b className='text-gray-800'>Data Protection</b>
          <p>
            We take reasonable security measures to protect your personal information and
            keep it safe from unauthorized access, misuse, or disclosure.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <b className='text-gray-800'>Sharing of Information</b>
          <p>
            We do not sell or rent your personal information. We may share limited details
            only with trusted service providers when necessary to complete orders or operate
            our business.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <b className='text-gray-800'>Cookies and Usage Data</b>
          <p>
            Our website may use cookies or similar technologies to improve browsing,
            remember preferences, and understand how visitors use the site.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <b className='text-gray-800'>Your Rights</b>
          <p>
            You may contact us to update or remove your personal information, subject to
            legal and operational requirements.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <b className='text-gray-800'>Contact Us</b>
          <p>
            If you have any questions about this Privacy Policy, please contact Kiddy Vogue
            using the details provided on our website.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
