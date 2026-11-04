'use client';

import React from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  const servicesList = [
    {
      num: '01',
      title: 'Handcrafted Physical Keepsakes',
      subtitle: 'Artisan Paper & Letterpress Cards',
      desc: 'Bespoke heavyweight cardstock, custom debossing, foil lettering, and handcrafted wax seals designed to be cherished for lifetimes.',
      ctaText: 'Explore Cards',
      ctaHref: '/shop',
    },
    {
      num: '02',
      title: '3D WebGL Digital Portals',
      subtitle: 'Dynamic Virtual Gift Experiences',
      desc: 'Each physical keepsake is imprinted with a unique access code unlocking an immersive, interactive 3D digital book with customized background audio and animated dedication letters.',
      ctaText: 'Access Portal',
      ctaHref: '/portal',
    },
    {
      num: '03',
      title: 'Luxury Add-on Pairings',
      subtitle: 'Florals, Fine Jewelry & Chocolates',
      desc: 'Curated botanicals (FLW - 23), solid 14k gold ring sets (JWL - 17), and artisan single-origin chocolates (CHLTE - 36) to complement your personalized note.',
      ctaText: 'Shop Add-ons',
      ctaHref: '/shop',
    },
    {
      num: '04',
      title: 'Bespoke Budget Gifting',
      subtitle: 'Give Us A Budget, We Handle The Rest',
      desc: 'Unsure what to gift? Provide a budget and recipient profile, and our master craftspeople hand-assemble a personalized keepsake suite tailored to your exact specifications.',
      ctaText: 'Custom Order',
      ctaHref: '/customize',
    },
  ];

  return (
    <div style={{ paddingTop: '2rem', minHeight: '80vh' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ padding: '4rem 0 3rem 0', maxWidth: '800px' }}>
          <h1 className="heading-xl" style={{ fontWeight: 300, lineHeight: 1.08, marginBottom: '1.5rem' }}>
            <span style={{ color: '#989898' }}>lets worry about <br />the </span>
            <span style={{ color: '#D9D2C7' }}>hard part.</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '620px' }}>
            We craft gifts that are memorable. From tactile stationery and hand-lettered cards to immersive
            3D WebGL digital scenes, explore our suite of bespoke gifting experiences.
          </p>
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            padding: '2rem 0 5rem 0',
          }}
        >
          {servicesList.map((svc) => (
            <div
              key={svc.num}
              style={{
                backgroundColor: '#161616',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#C5A059',
                    letterSpacing: '0.15em',
                    display: 'block',
                    marginBottom: '1rem',
                  }}
                >
                  {svc.num}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  {svc.title}
                </h2>
                <h3 style={{ fontSize: '0.85rem', color: '#888888', fontWeight: 300, marginBottom: '1.5rem' }}>
                  {svc.subtitle}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#A0A0A0', lineHeight: 1.6, marginBottom: '2rem' }}>
                  {svc.desc}
                </p>
              </div>

              <Link
                href={svc.ctaHref}
                className="btn-pill btn-pill-dark"
                style={{ alignSelf: 'flex-start', padding: '0.65rem 1.8rem', fontSize: '0.82rem' }}
              >
                {svc.ctaText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
