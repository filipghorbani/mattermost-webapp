// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Stripe, loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';

import moment from 'moment';

import upgradeImage from 'images/cloud/upgrade.svg';
import wavesBackground from 'images/cloud/waves.svg';
import blueDotes from 'images/cloud/blue.svg';

import cloudLogo from 'images/cloud/mattermost-cloud.svg';

import RootPortal from 'components/root_portal';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';

import {areBillingDetailsValid, BillingDetails} from 'components/cloud/types/sku';

import PaymentForm from '../payment_form/payment_form';

import './purchase.scss';
import 'components/payment_form/payment_form.scss';
import ProcessPaymentSetup from './process_payment_setup';

const STRIPE_CSS_SRC = 'https://fonts.googleapis.com/css?family=Open+Sans:400,400i,600,600i&display=swap';
const STRIPE_PUBLIC_KEY = 'pk_test_ttEpW6dCHksKyfAFzh6MvgBj';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

type Props = {
    show: boolean;
    actions: {
        closeModal: () => void;
        getProductPrice: () => Promise<number>;
        completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails) => Promise<string | null>;
    };
}

type State = {
    paymentInfoIsValid: boolean;
    productPrice: number;
    billingDetails: BillingDetails | null;
    processing: boolean;
}
export default class PurchaseModal extends React.PureComponent<Props, State> {
    modal = React.createRef();

    public constructor(props: Props) {
        super(props);

        this.state = {
            paymentInfoIsValid: false,
            productPrice: 0,
            billingDetails: null,
            processing: false,
        };
    }

    componentDidMount() {
        this.fetchProductPrice();
    }

    async fetchProductPrice() {
        const productPrice = await this.props.actions.getProductPrice();
        this.setState({productPrice});
    }

    onPaymentInput = (billing: BillingDetails) => {
        this.setState({paymentInfoIsValid: areBillingDetailsValid(billing)});
        this.setState({billingDetails: billing});
    }

    handleSubmitClick = async () => {
        this.setState({processing: true, paymentInfoIsValid: false});
    }

    nextBillingDate = () => {
        const nextBillingDate = moment().add(1, 'months').startOf('month');
        return nextBillingDate.format('MMM D, YYYY');
    }

    purchaseScreen = () => {
        return (
            <React.Fragment>
                <div className='LHS'>
                    <div className='title'>
                        <FormattedMessage
                            defaultMessage={'Upgrade your Mattermost Cloud Susbcription'}
                            id={'admin.billing.subscription.upgradeCloudSubscription'}
                        />
                    </div>
                    <img
                        className='image'
                        alt='upgrade'
                        src={upgradeImage}
                    />
                    <div className='footer-text'>
                        <FormattedMessage
                            defaultMessage={'Questions?'}
                            id={'admin.billing.subscription.questions'}
                        />
                    </div>
                    <a
                        className='footer-text'
                        href='https://support.mattermost.com/hc/en-us/requests/new?ticket_form_id=360000640492'
                    >
                        <FormattedMessage
                            defaultMessage={'Contact Support'}
                            id={
                                'admin.billing.subscription.privateCloudCard.contactSupport'
                            }
                        />
                    </a>
                </div>
                <div className='central-panel'>
                    <PaymentForm
                        className='normal-text'
                        onInputChange={this.onPaymentInput}
                    />
                </div>
                <div className='RHS'>
                    <div className='price-container'>
                        <div className='bold-text'>
                            <FormattedMessage
                                defaultMessage={'Mattermost Cloud'}
                                id={'admin.billing.subscription.mattermostCloud'}
                            />
                        </div>
                        <div className='price-text'>
                            {`$${this.state.productPrice}`}
                            <span className='monthly-text'>
                                <FormattedMessage
                                    defaultMessage={' /user/month'}
                                    id={'admin.billing.subscription.perUserPerMonth'}
                                />
                            </span>
                        </div>
                        <div className='footer-text'>{`Payment begins: ${this.nextBillingDate()}`}</div>
                        <button
                            disabled={!this.state.paymentInfoIsValid}
                            onClick={this.handleSubmitClick}
                        >
                            <FormattedMessage
                                defaultMessage={'Upgrade'}
                                id={'admin.billing.subscription.upgrade'}
                            />
                        </button>
                        <div className='fineprint-text'>
                            <span>
                                <FormattedMessage
                                    defaultMessage={'Your total is calculated at the end of the billing cycle based on the number of enabled users. You’ll only be charged if you exceed the free tier limits. '}
                                    id={'admin.billing.subscription.disclaimer'}
                                />
                            </span>
                            <a href='https://support.mattermost.com/hc/en-us/requests/new?ticket_form_id=360000640492'>
                                <FormattedMessage
                                    defaultMessage={'See how billing works.'}
                                    id={'admin.billing.subscription.howItWorks'}
                                />
                            </a>
                        </div>
                    </div>
                    <div className='footer-text'>{'Need other billing options?'}</div>
                    <a
                        className='footer-text'
                        href='https://support.mattermost.com/hc/en-us/requests/new?ticket_form_id=360000640492'
                    >
                        <FormattedMessage
                            defaultMessage={'Contact Sales'}
                            id={'admin.billing.subscription.privateCloudCard.contactSales'}
                        />
                    </a>

                    <div className='logo'>
                        <img src={cloudLogo}/>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    render() {
        return (
            <Elements
                options={{fonts: [{cssSrc: STRIPE_CSS_SRC}]}}
                stripe={stripePromise}
            >
                <RootPortal>
                    <FullScreenModal
                        show={Boolean(this.props.show)}
                        onClose={this.props.actions.closeModal}
                        ref={this.modal}

                        ariaLabelledBy='purchase_modal_title'
                    >
                        <div className='PurchaseModal'>
                            { this.state.processing ? <div>
                                <ProcessPaymentSetup
                                    stripe={stripePromise}
                                    billingDetails={this.state.billingDetails}
                                    addPaymentMethod={this.props.actions.completeStripeAddPaymentMethod}
                                    onClose={this.props.actions.closeModal}
                                    onBack={() => {
                                        this.setState({processing: false});
                                    }}
                                /></div> : this.purchaseScreen()
                            }
                            <div>
                                <img
                                    className='waves'
                                    src={wavesBackground}
                                />
                                <img
                                    className='blue-dots'
                                    src={blueDotes}
                                />
                            </div>
                        </div>
                    </FullScreenModal>
                </RootPortal>
            </Elements>
        );
    }
}